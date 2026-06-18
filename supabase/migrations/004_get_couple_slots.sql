-- Permet à l'écran d'inscription de voir quels rôles sont déjà pris (sans être connecté)

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

GRANT EXECUTE ON FUNCTION get_couple_slots() TO anon, authenticated;
