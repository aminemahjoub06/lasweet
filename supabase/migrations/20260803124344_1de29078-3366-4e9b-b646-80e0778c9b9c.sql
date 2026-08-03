CREATE TABLE public.delivery_slot_locks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_date DATE NOT NULL,
  delivery_time TEXT NOT NULL,
  order_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_delivery_slot UNIQUE (delivery_date, delivery_time)
);

GRANT ALL ON public.delivery_slot_locks TO service_role;

ALTER TABLE public.delivery_slot_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only delivery slot locks"
ON public.delivery_slot_locks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX idx_delivery_slot_locks_date ON public.delivery_slot_locks (delivery_date);
CREATE INDEX idx_delivery_slot_locks_order ON public.delivery_slot_locks (order_number);