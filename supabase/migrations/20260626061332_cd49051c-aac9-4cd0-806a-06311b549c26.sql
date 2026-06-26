
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_plan TEXT NOT NULL DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS amount_paid_online NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due_cash NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_collected_at TIMESTAMPTZ NULL;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_plan_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_plan_check
  CHECK (payment_plan IN ('full', 'deposit_50'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'cash_pending', 'deposit_paid', 'refunded', 'partially_refunded'));
