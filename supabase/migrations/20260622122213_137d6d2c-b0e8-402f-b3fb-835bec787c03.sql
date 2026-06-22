
CREATE TABLE public.rate_limit_attempts (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('ip','email')),
  identifier text not null,
  endpoint text not null,
  created_at timestamptz not null default now()
);
CREATE INDEX rate_limit_attempts_lookup_idx ON public.rate_limit_attempts (scope, identifier, created_at DESC);
GRANT ALL ON public.rate_limit_attempts TO service_role;
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rate_limit_log (
  id uuid primary key default gen_random_uuid(),
  ip text,
  email text,
  endpoint text not null,
  reason text not null,
  ip_count int,
  email_count int,
  created_at timestamptz not null default now()
);
CREATE INDEX rate_limit_log_created_idx ON public.rate_limit_log (created_at DESC);
GRANT ALL ON public.rate_limit_log TO service_role;
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rate_limit_allowlist (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('ip','email')),
  value text not null,
  note text,
  created_at timestamptz not null default now(),
  unique (kind, value)
);
GRANT ALL ON public.rate_limit_allowlist TO service_role;
ALTER TABLE public.rate_limit_allowlist ENABLE ROW LEVEL SECURITY;
