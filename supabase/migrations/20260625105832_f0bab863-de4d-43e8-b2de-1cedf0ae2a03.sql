
-- 1) Table
CREATE TABLE IF NOT EXISTS public.daily_stock (
  product_key TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  units_remaining INTEGER NOT NULL DEFAULT 18 CHECK (units_remaining >= 0),
  initial_units INTEGER NOT NULL DEFAULT 18 CHECK (initial_units >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_key, delivery_date)
);

GRANT SELECT ON public.daily_stock TO anon, authenticated;
GRANT ALL ON public.daily_stock TO service_role;

ALTER TABLE public.daily_stock ENABLE ROW LEVEL SECURITY;

-- Public read so the storefront can show remaining stock per date.
CREATE POLICY "Public can read daily stock"
ON public.daily_stock FOR SELECT
TO anon, authenticated
USING (true);

-- 2) get_or_init: returns current units_remaining, inserting a default row if missing.
CREATE OR REPLACE FUNCTION public.get_or_init_daily_stock(
  p_product_key TEXT,
  p_delivery_date DATE,
  p_default_units INTEGER DEFAULT 18
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_units INTEGER;
BEGIN
  INSERT INTO public.daily_stock (product_key, delivery_date, units_remaining, initial_units)
  VALUES (p_product_key, p_delivery_date, p_default_units, p_default_units)
  ON CONFLICT (product_key, delivery_date) DO NOTHING;

  SELECT units_remaining INTO v_units
  FROM public.daily_stock
  WHERE product_key = p_product_key AND delivery_date = p_delivery_date;

  RETURN COALESCE(v_units, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_init_daily_stock(TEXT, DATE, INTEGER) TO anon, authenticated, service_role;

-- 3) decrement: atomic. Returns remaining after decrement, or -1 if insufficient stock.
CREATE OR REPLACE FUNCTION public.decrement_daily_stock(
  p_product_key TEXT,
  p_delivery_date DATE,
  p_qty INTEGER,
  p_default_units INTEGER DEFAULT 18
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new INTEGER;
BEGIN
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'qty must be > 0';
  END IF;

  -- Ensure the row exists at the default.
  INSERT INTO public.daily_stock (product_key, delivery_date, units_remaining, initial_units)
  VALUES (p_product_key, p_delivery_date, p_default_units, p_default_units)
  ON CONFLICT (product_key, delivery_date) DO NOTHING;

  -- Atomic conditional update — only succeeds if enough stock remains.
  UPDATE public.daily_stock
  SET units_remaining = units_remaining - p_qty,
      updated_at = now()
  WHERE product_key = p_product_key
    AND delivery_date = p_delivery_date
    AND units_remaining >= p_qty
  RETURNING units_remaining INTO v_new;

  IF v_new IS NULL THEN
    RETURN -1; -- insufficient
  END IF;

  RETURN v_new;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_daily_stock(TEXT, DATE, INTEGER, INTEGER) TO service_role;

-- 4) restore: add units back (refund/cancel). Caps at initial_units.
CREATE OR REPLACE FUNCTION public.restore_daily_stock(
  p_product_key TEXT,
  p_delivery_date DATE,
  p_qty INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new INTEGER;
BEGIN
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'qty must be > 0';
  END IF;

  UPDATE public.daily_stock
  SET units_remaining = LEAST(units_remaining + p_qty, initial_units),
      updated_at = now()
  WHERE product_key = p_product_key
    AND delivery_date = p_delivery_date
  RETURNING units_remaining INTO v_new;

  RETURN COALESCE(v_new, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.restore_daily_stock(TEXT, DATE, INTEGER) TO service_role;
