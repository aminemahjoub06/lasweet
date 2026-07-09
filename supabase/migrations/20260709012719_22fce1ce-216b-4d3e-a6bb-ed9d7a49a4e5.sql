
CREATE TABLE IF NOT EXISTS public.geocoding_cache (
  address text PRIMARY KEY,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  provider text NOT NULL DEFAULT 'nominatim',
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.geocoding_cache TO service_role;
ALTER TABLE public.geocoding_cache ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_distance_km numeric(6,2),
  ADD COLUMN IF NOT EXISTS delivery_lat double precision,
  ADD COLUMN IF NOT EXISTS delivery_lng double precision,
  ADD COLUMN IF NOT EXISTS pending_delivery_quote boolean NOT NULL DEFAULT false;
