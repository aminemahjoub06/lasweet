
CREATE POLICY "Service role manages attempts" ON public.rate_limit_attempts FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role manages log" ON public.rate_limit_log FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role manages allowlist" ON public.rate_limit_allowlist FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
