-- Create testimonials table for client feedback
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  service VARCHAR(100),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_testimonials_approved ON testimonials(is_approved, created_at DESC);
CREATE INDEX idx_testimonials_created ON testimonials(created_at DESC);

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert a testimonial (submit feedback)
CREATE POLICY "Anyone can submit testimonials"
  ON testimonials
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only approved testimonials are visible to everyone
CREATE POLICY "Approved testimonials are public"
  ON testimonials
  FOR SELECT
  USING (is_approved = true);

-- Add TikTok field to settings table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'settings' AND column_name = 'tiktok'
  ) THEN
    ALTER TABLE settings ADD COLUMN tiktok TEXT DEFAULT '';
  END IF;
END $$;

-- Update the trigger for updated_at
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonials_updated_at();

-- Insert some sample testimonials (approved by default for demo)
INSERT INTO testimonials (name, email, rating, message, service, is_approved) VALUES
  ('Jean Dupont', 'jean.dupont@example.com', 5, 'Service exceptionnel ! L''équipe est très professionnelle et le résultat est toujours impeccable.', 'Coupe homme', true),
  ('Marie Bernard', 'marie.bernard@example.com', 5, 'Meilleur salon de Namur ! Ambiance chaleureuse et coiffeurs talentueux.', 'Dégradé', true),
  ('Thomas Martin', 'thomas.martin@example.com', 5, 'Je reviens toujours avec plaisir. La qualité du service est constante.', 'Coupe + Barbe', true);
