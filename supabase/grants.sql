-- Permissions production — exécuter après 003_auth_couple.sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON goal_progress TO authenticated;

REVOKE ALL ON goals FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals TO authenticated;

GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON couples TO authenticated;

DROP POLICY IF EXISTS "allow_all_dev" ON goals;
