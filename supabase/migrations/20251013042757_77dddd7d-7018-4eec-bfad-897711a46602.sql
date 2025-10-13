-- Fix function search paths for security
DROP FUNCTION IF EXISTS public.get_sample_roasts(INTEGER);
DROP FUNCTION IF EXISTS public.increment_reaction(UUID, TEXT);

-- Recreate get_sample_roasts with secure search_path
CREATE OR REPLACE FUNCTION public.get_sample_roasts(sample_size INTEGER DEFAULT 3)
RETURNS SETOF public.roasts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.roasts
  ORDER BY RANDOM()
  LIMIT sample_size;
$$;

-- Recreate increment_reaction with secure search_path
CREATE OR REPLACE FUNCTION public.increment_reaction(
  roast_id UUID,
  reaction_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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