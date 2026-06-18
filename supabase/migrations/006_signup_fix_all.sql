-- Script unique à exécuter si l'inscription échoue (profil non créé)
-- Supabase → SQL Editor → coller tout ce fichier → Run

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION complete_profile_for_user(
  p_user_id UUID,
  p_display_name TEXT,
  p_space_type space_type
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_couple_id UUID;
  v_profile public.profiles;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur invalide';
  END IF;

  IF p_space_type NOT IN ('user_a', 'user_b') THEN
    RAISE EXCEPTION 'Rôle invalide';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
    RETURN v_profile;
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE space_type = p_space_type) THEN
    RAISE EXCEPTION 'Ce rôle est déjà attribué à un autre compte';
  END IF;

  IF (SELECT COUNT(*) FROM public.profiles) >= 2 THEN
    RAISE EXCEPTION 'Ce couple est complet (2 comptes maximum)';
  END IF;

  SELECT couple_id INTO v_couple_id FROM public.profiles LIMIT 1;
  IF v_couple_id IS NULL THEN
    INSERT INTO public.couples DEFAULT VALUES RETURNING id INTO v_couple_id;
  END IF;

  INSERT INTO public.profiles (id, display_name, space_type, couple_id)
  VALUES (
    p_user_id,
    COALESCE(NULLIF(trim(p_display_name), ''), 'Utilisateur'),
    p_space_type,
    v_couple_id
  )
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

CREATE OR REPLACE FUNCTION complete_profile(
  p_display_name TEXT,
  p_space_type space_type
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  RETURN complete_profile_for_user(auth.uid(), p_display_name, p_space_type);
END;
$$;

CREATE OR REPLACE FUNCTION get_couple_slots()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'user_a', EXISTS(SELECT 1 FROM public.profiles WHERE space_type = 'user_a'),
    'user_b', EXISTS(SELECT 1 FROM public.profiles WHERE space_type = 'user_b')
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_space_type TEXT;
  v_display_name TEXT;
BEGIN
  v_space_type := NEW.raw_user_meta_data->>'space_type';
  v_display_name := NEW.raw_user_meta_data->>'display_name';

  IF v_space_type IS NULL OR v_space_type NOT IN ('user_a', 'user_b') THEN
    RETURN NEW;
  END IF;

  PERFORM complete_profile_for_user(
    NEW.id,
    v_display_name,
    v_space_type::space_type
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION complete_profile(TEXT, space_type) TO authenticated;
GRANT EXECUTE ON FUNCTION get_couple_slots() TO anon, authenticated;

-- Réparer les comptes déjà créés sans profil (exécutez une fois si besoin)
DO $$
DECLARE
  u RECORD;
  v_space TEXT;
  v_name TEXT;
BEGIN
  FOR u IN
    SELECT id, raw_user_meta_data
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    v_space := u.raw_user_meta_data->>'space_type';
    v_name := u.raw_user_meta_data->>'display_name';
    IF v_space IN ('user_a', 'user_b') THEN
      BEGIN
        PERFORM complete_profile_for_user(u.id, v_name, v_space::space_type);
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Skip user %: %', u.id, SQLERRM;
      END;
    END IF;
  END LOOP;
END;
$$;
