DO $$
DECLARE
  fn text;
  sig text;
BEGIN
  FOR fn, sig IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND p.proname IN (
        'delete_email','enqueue_email','read_email_batch','update_updated_at_column',
        'restore_daily_stock','decrement_daily_stock','get_or_init_daily_stock',
        'move_to_dlq','email_queue_wake','email_queue_dispatch'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC, anon, authenticated;', fn, sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO service_role;', fn, sig);
  END LOOP;
END $$;