-- Create roasts table to store resume analyses
CREATE TABLE public.roasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_text TEXT NOT NULL,
  roast_feedback TEXT NOT NULL,
  roast_type TEXT DEFAULT 'general',
  fire_count INTEGER DEFAULT 0,
  laugh_count INTEGER DEFAULT 0,
  thinking_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.roasts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read roasts (for examples/samples)
CREATE POLICY "Anyone can view roasts" 
ON public.roasts 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert roasts (no auth required for MVP)
CREATE POLICY "Anyone can create roasts" 
ON public.roasts 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to update reaction counts
CREATE POLICY "Anyone can update reactions" 
ON public.roasts 
FOR UPDATE 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_roasts_created_at ON public.roasts(created_at DESC);

-- Create a function to get random sample roasts
CREATE OR REPLACE FUNCTION public.get_sample_roasts(sample_size INTEGER DEFAULT 3)
RETURNS SETOF public.roasts
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.roasts
  ORDER BY RANDOM()
  LIMIT sample_size;
$$;

-- Create a function to increment reaction counts
CREATE OR REPLACE FUNCTION public.increment_reaction(
  roast_id UUID,
  reaction_type TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF reaction_type = 'fire' THEN
    UPDATE public.roasts SET fire_count = fire_count + 1 WHERE id = roast_id;
  ELSIF reaction_type = 'laugh' THEN
    UPDATE public.roasts SET laugh_count = laugh_count + 1 WHERE id = roast_id;
  ELSIF reaction_type = 'thinking' THEN
    UPDATE public.roasts SET thinking_count = thinking_count + 1 WHERE id = roast_id;
  END IF;
END;
$$;

-- Insert some sample roasts for the examples section
INSERT INTO public.roasts (original_text, roast_feedback, roast_type, fire_count, laugh_count, thinking_count) VALUES
(
  'Responsible for managing team projects and ensuring timely delivery.',
  'This is so vague, recruiters will think you managed to deliver pizza on time. What team? What projects? How many? Show us numbers or we''ll assume zero.',
  'vague',
  124,
  57,
  12
),
(
  'Excellent communication skills and team player.',
  '"Excellent communication skills" - said by everyone who''s ever forgotten to attach the document to their email. This tells me nothing about your actual abilities.',
  'cliche',
  203,
  89,
  8
),
(
  'Proficient in Microsoft Office Suite.',
  'Wow, proficient in MS Office! Next you''ll tell me you''re proficient in breathing and using indoor plumbing. In 2024, this is like saying you know how to use a pencil.',
  'outdated',
  347,
  156,
  23
);