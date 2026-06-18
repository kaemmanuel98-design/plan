-- VisionDual — Schéma PostgreSQL / Supabase (idempotent)
-- Peut être réexécuté sans erreur si les objets existent déjà.
-- Pour une base vide : exécutez ce fichier puis supabase/grants.sql
-- Pour la récurrence premium : exécutez supabase/migrations/001_recurrence.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types ENUM (PostgreSQL n'a pas CREATE TYPE IF NOT EXISTS)
DO $$ BEGIN
  CREATE TYPE space_type AS ENUM ('user_a', 'user_b', 'shared');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE pillar_id AS ENUM (
    'financier',
    'sport_sante',
    'carriere',
    'couple_famille',
    'developpement'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE goal_level AS ENUM (
    'global_vision',
    'annual',
    'semester',
    'quarterly',
    'monthly',
    'weekly',
    'daily',
    'time_block'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table principale
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  space_type space_type NOT NULL,
  level goal_level NOT NULL,
  pillar_id pillar_id NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  completed BOOLEAN DEFAULT FALSE,
  period_label TEXT,
  start_time TIME,
  end_time TIME,
  swot_strengths TEXT,
  swot_weaknesses TEXT,
  swot_opportunities TEXT,
  swot_threats TEXT,
  smart_specific BOOLEAN DEFAULT FALSE,
  smart_measurable BOOLEAN DEFAULT FALSE,
  smart_achievable BOOLEAN DEFAULT FALSE,
  smart_realistic BOOLEAN DEFAULT FALSE,
  smart_time_bound BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_hierarchy CHECK (
    (level = 'global_vision' AND parent_id IS NULL) OR
    (level != 'global_vision' AND parent_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_goals_parent_id ON goals(parent_id);
CREATE INDEX IF NOT EXISTS idx_goals_space_type ON goals(space_type);
CREATE INDEX IF NOT EXISTS idx_goals_level ON goals(level);
CREATE INDEX IF NOT EXISTS idx_goals_pillar_id ON goals(pillar_id);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(completed);
CREATE INDEX IF NOT EXISTS idx_goals_space_level ON goals(space_type, level);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS goals_updated_at ON goals;
CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE VIEW goal_progress AS
WITH RECURSIVE descendants AS (
  SELECT id AS root_id, id AS descendant_id, completed
  FROM goals
  UNION ALL
  SELECT d.root_id, g.id, g.completed
  FROM descendants d
  JOIN goals g ON g.parent_id = d.descendant_id
)
SELECT
  root_id AS goal_id,
  COUNT(*) AS total_children,
  COUNT(*) FILTER (WHERE completed) AS completed_children,
  CASE
    WHEN COUNT(*) = 0 THEN 0
    ELSE ROUND((COUNT(*) FILTER (WHERE completed)::NUMERIC / COUNT(*)) * 100)
  END AS progress_percent
FROM descendants
WHERE root_id != descendant_id
GROUP BY root_id;

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- ⚠️ NE PAS utiliser les policies ci-dessous en production.
-- Exécutez supabase/migrations/003_auth_couple.sql puis 007_security_hardening.sql
DROP POLICY IF EXISTS "user_a_access" ON goals;
DROP POLICY IF EXISTS "user_b_access" ON goals;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  space_type space_type NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO goals (id, parent_id, space_type, level, pillar_id, title, description, completed)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  NULL,
  'shared',
  'global_vision',
  'couple_famille',
  'Construire notre foyer dans 2 ans',
  'Acheter et aménager notre première maison ensemble',
  false
)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE goals IS 'Objectifs convergents hiérarchiques — VisionDual';
COMMENT ON COLUMN goals.parent_id IS 'Référence parent pour la cascade d''objectifs';
COMMENT ON COLUMN goals.space_type IS 'Espace : user_a (Mon), user_b (Son), shared (Notre)';
