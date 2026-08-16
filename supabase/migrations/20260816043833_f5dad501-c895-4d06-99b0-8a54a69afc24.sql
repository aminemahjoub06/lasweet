ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.orders FROM anon, authenticated;
GRANT ALL ON public.orders TO service_role;
DROP POLICY IF EXISTS "Service role only orders" ON public.orders;
CREATE POLICY "Service role only orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);