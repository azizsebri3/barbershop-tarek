-- Run this once in the Supabase SQL Editor for an existing database.
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS language VARCHAR(2) NOT NULL DEFAULT 'fr';
