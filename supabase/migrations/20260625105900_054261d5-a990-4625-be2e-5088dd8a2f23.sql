
REVOKE EXECUTE ON FUNCTION public.get_or_init_daily_stock(TEXT, DATE, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_daily_stock(TEXT, DATE, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_daily_stock(TEXT, DATE, INTEGER) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_or_init_daily_stock(TEXT, DATE, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.decrement_daily_stock(TEXT, DATE, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.restore_daily_stock(TEXT, DATE, INTEGER) TO service_role;
