ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

UPDATE bookings
SET duration_minutes = CASE
  WHEN service = 'Barbe + Coupe' THEN 60
  ELSE 30
END
WHERE duration_minutes IS NULL;
