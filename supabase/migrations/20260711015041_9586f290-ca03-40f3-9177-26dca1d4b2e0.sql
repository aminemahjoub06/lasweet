REVOKE EXECUTE ON FUNCTION public.get_or_init_daily_stock(TEXT, DATE, INTEGER) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_daily_stock(TEXT, DATE, INTEGER, INTEGER) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_daily_stock(TEXT, DATE, INTEGER) FROM anon, authenticated;