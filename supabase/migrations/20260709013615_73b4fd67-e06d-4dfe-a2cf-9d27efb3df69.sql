-- Remove public read on daily_stock (server reads via service role)
DROP POLICY IF EXISTS "Public can read daily stock" ON public.daily_stock;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.daily_stock FROM anon, authenticated;
GRANT ALL ON public.daily_stock TO service_role;

-- geocoding_cache: service-role only, no anon/authenticated access
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.geocoding_cache FROM anon, authenticated;
GRANT ALL ON public.geocoding_cache TO service_role;
CREATE POLICY "Service role only" ON public.geocoding_cache FOR ALL TO service_role USING (true) WITH CHECK (true);