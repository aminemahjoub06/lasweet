CREATE TABLE public.order_request_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL,
  action text NOT NULL CHECK (action IN ('accept','decline','pay')),
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT ALL ON public.order_request_tokens TO service_role;
ALTER TABLE public.order_request_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only order request tokens" ON public.order_request_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX order_request_tokens_order_idx ON public.order_request_tokens (order_number);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS request_submitted_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS request_actioned_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS payment_link_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS stock_reserved_at timestamp with time zone;