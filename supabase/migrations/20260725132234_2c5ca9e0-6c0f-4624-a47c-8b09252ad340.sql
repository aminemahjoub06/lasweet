ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS calendar_event_id text,
  ADD COLUMN IF NOT EXISTS calendar_sync_status text,
  ADD COLUMN IF NOT EXISTS calendar_sync_error text,
  ADD COLUMN IF NOT EXISTS calendar_synced_at timestamptz;