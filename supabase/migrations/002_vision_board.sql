-- Vision Board : image d'inspiration sur les visions globales
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS inspiration_image_url TEXT;

COMMENT ON COLUMN goals.inspiration_image_url IS 'URL ou data-URL de l''image du vision board (vision globale)';
