ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS no_show_cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS order_status TEXT;

CREATE TABLE IF NOT EXISTS public.no_show_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  cancelled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.no_show_log TO service_role;

ALTER TABLE public.no_show_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only no show log"
  ON public.no_show_log FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_no_show_log_order_number ON public.no_show_log (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_sweep
  ON public.orders (delivery_method, delivery_date)
  WHERE picked_up_at IS NULL AND no_show_cancelled_at IS NULL;