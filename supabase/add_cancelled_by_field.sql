-- Add cancelled_by field to distinguish between client and admin cancellations
ALTER TABLE public.bookings
ADD COLUMN cancelled_by TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.bookings.cancelled_by IS 'Who cancelled the booking: client or admin (NULL if not cancelled)';

-- Create index for filtering
CREATE INDEX idx_bookings_cancelled_by ON public.bookings(cancelled_by);
