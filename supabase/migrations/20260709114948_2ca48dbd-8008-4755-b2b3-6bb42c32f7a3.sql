
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL CHECK (length(comment) BETWEEN 20 AND 1000),
  photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes TEXT NULL,
  verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ NULL,
  ip_address TEXT NULL
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Service role full access to reviews"
  ON public.reviews FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_reviews_status_created ON public.reviews (status, created_at DESC);
CREATE INDEX idx_reviews_email_day ON public.reviews (reviewer_email, created_at DESC);
CREATE INDEX idx_reviews_ip_day ON public.reviews (ip_address, created_at DESC);

CREATE TABLE public.review_moderation_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approve','reject')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.review_moderation_tokens TO service_role;

ALTER TABLE public.review_moderation_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only moderation tokens"
  ON public.review_moderation_tokens FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Reminder cron log
CREATE TABLE public.review_reminder_log (
  order_number TEXT NOT NULL PRIMARY KEY,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.review_reminder_log TO service_role;

ALTER TABLE public.review_reminder_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only reminder log"
  ON public.review_reminder_log FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
