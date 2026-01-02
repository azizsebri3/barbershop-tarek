-- Add cancel_note column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_note TEXT;

-- Add comment for documentation
COMMENT ON COLUMN bookings.cancel_note IS 'Optional note provided by admin when cancelling a booking';