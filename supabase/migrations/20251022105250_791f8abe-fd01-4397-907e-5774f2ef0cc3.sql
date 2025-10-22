-- Create a function to get total contributions that all authenticated users can access
CREATE OR REPLACE FUNCTION public.get_total_contributions()
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.contributions
  WHERE status = 'paid'
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_total_contributions() TO authenticated;