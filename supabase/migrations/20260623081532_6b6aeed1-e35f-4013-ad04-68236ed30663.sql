ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status = ANY (ARRAY[
    'pending'::text,
    'paid'::text,
    'failed'::text,
    'cash_pending'::text,
    'refunded'::text,
    'partially_refunded'::text
  ]));

CREATE TABLE IF NOT EXISTS public.pending_cleanup_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rows_updated INTEGER NOT NULL DEFAULT 0,
  rows_recovered INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);

GRANT ALL ON public.pending_cleanup_log TO service_role;

ALTER TABLE public.pending_cleanup_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages pending cleanup log"
  ON public.pending_cleanup_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);