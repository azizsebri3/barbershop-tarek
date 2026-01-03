-- Add cancel_note column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_note TEXT;

-- Add index for better performance when filtering cancelled bookings
CREATE INDEX IF NOT EXISTS bookings_cancel_note_idx ON bookings(cancel_note) WHERE cancel_note IS NOT NULL;