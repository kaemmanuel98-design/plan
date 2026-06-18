-- Migration premium : récurrence des tâches
-- Exécutez uniquement si la table goals existe déjà (après schema.sql)

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS recurrence TEXT;

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS recurrence_completed_at TIMESTAMPTZ;

DO $$ BEGIN
  ALTER TABLE goals
    ADD CONSTRAINT goals_recurrence_check
    CHECK (recurrence IS NULL OR recurrence IN ('weekly', 'monthly'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN goals.recurrence IS 'Récurrence : weekly ou monthly (premium)';
COMMENT ON COLUMN goals.recurrence_completed_at IS 'Date de complétion dans la période courante';
