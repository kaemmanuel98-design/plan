-- Permissions production — exécuter après 003–007
GRANT USAGE ON SCHEMA public TO authenticated;

REVOKE ALL ON goals FROM anon;
REVOKE ALL ON goals FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals TO authenticated;

REVOKE ALL ON profiles FROM anon;
GRANT SELECT ON profiles TO authenticated;

GRANT SELECT ON couples TO authenticated;

REVOKE ALL ON goal_progress FROM PUBLIC;
REVOKE ALL ON goal_progress FROM anon;
REVOKE ALL ON goal_progress FROM authenticated;

GRANT EXECUTE ON FUNCTION complete_profile(TEXT, space_type) TO authenticated;
GRANT EXECUTE ON FUNCTION get_couple_slots() TO anon, authenticated;

DROP POLICY IF EXISTS "allow_all_dev" ON goals;
DROP POLICY IF EXISTS "user_a_access" ON goals;
DROP POLICY IF EXISTS "user_b_access" ON goals;
