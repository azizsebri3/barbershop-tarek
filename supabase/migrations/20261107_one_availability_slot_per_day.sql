-- Keep the availability model to one authoritative row per date.
DELETE FROM availability_slots older
USING availability_slots newer
WHERE older.date = newer.date
  AND (
    older.created_at < newer.created_at
    OR (older.created_at = newer.created_at AND older.id < newer.id)
  );

DROP INDEX IF EXISTS unique_availability_slot;

CREATE UNIQUE INDEX unique_availability_slot
ON availability_slots(date);
