-- Authentification couple : 2 comptes max (Monsieur + Madame), accès RLS par espace

CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION auth_user_space()
RETURNS space_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT space_type FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION can_access_goal_space(goal_space space_type)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE auth_user_space()
    WHEN 'user_a' THEN goal_space IN ('user_a', 'shared')
    WHEN 'user_b' THEN goal_space IN ('user_b', 'shared')
    ELSE false
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
DECLARE
  v_couple_id UUID;
  v_profile public.profiles;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Profil déjà créé';
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
  VALUES (auth.uid(), p_display_name, p_space_type, v_couple_id)
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION complete_profile(TEXT, space_type) TO authenticated;

-- RLS goals : utilisateurs authentifiés uniquement
DROP POLICY IF EXISTS "allow_all_dev" ON goals;
DROP POLICY IF EXISTS "user_a_access" ON goals;
DROP POLICY IF EXISTS "user_b_access" ON goals;
DROP POLICY IF EXISTS "authenticated_space_access" ON goals;

CREATE POLICY "authenticated_space_access" ON goals
  FOR ALL
  TO authenticated
  USING (can_access_goal_space(space_type))
  WITH CHECK (can_access_goal_space(space_type));

-- RLS profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_no_direct_write" ON profiles;
CREATE POLICY "profiles_no_direct_write" ON profiles
  FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);

-- couples : lecture pour membres authentifiés
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "couples_read_members" ON couples;
CREATE POLICY "couples_read_members" ON couples
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
  );
