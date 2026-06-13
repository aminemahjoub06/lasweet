
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
REVOKE INSERT ON public.orders FROM anon, authenticated;
