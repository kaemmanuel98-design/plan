-- Renforcement sécurité : contraintes, RLS stricte, révocation accès inutiles

-- Supprimer les anciennes policies permissives (si encore présentes)
DROP POLICY IF EXISTS "user_a_access" ON goals;
DROP POLICY IF EXISTS "user_b_access" ON goals;
DROP POLICY IF EXISTS "allow_all_dev" ON goals;

-- S'assurer que la policy couple est active
DROP POLICY IF EXISTS "authenticated_space_access" ON goals;
CREATE POLICY "authenticated_space_access" ON goals
  FOR ALL
  TO authenticated
  USING (can_access_goal_space(space_type))
  WITH CHECK (can_access_goal_space(space_type));

REVOKE ALL ON goals FROM anon;
REVOKE ALL ON goals FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals TO authenticated;

-- Vue goal_progress : pas d'accès direct (contourne potentiellement RLS)
REVOKE ALL ON goal_progress FROM PUBLIC;
REVOKE ALL ON goal_progress FROM anon;
REVOKE ALL ON goal_progress FROM authenticated;

-- Limites de taille côté base
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_title_length;
ALTER TABLE goals ADD CONSTRAINT goals_title_length CHECK (char_length(title) <= 200);

ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_description_length;
ALTER TABLE goals ADD CONSTRAINT goals_description_length CHECK (char_length(description) <= 2000);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'inspiration_image_url'
  ) THEN
    ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_inspiration_image_length;
    ALTER TABLE goals ADD CONSTRAINT goals_inspiration_image_length
      CHECK (inspiration_image_url IS NULL OR char_length(inspiration_image_url) <= 1200000);
  END IF;
END;
$$;

-- Profils : lecture uniquement de son propre profil
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

REVOKE ALL ON profiles FROM anon;
GRANT SELECT ON profiles TO authenticated;
