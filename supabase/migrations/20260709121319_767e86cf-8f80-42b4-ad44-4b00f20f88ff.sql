-- Remove public SELECT policy on reviews (was exposing reviewer_email and ip_address).
-- Public reads are already served through a server function using the service role
-- with an explicit safe-column projection.
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;

-- Remove the broad SELECT policy on the review-photos bucket that allowed
-- anonymous clients to list every object in the bucket. Files remain fetchable
-- via their public /object/public/review-photos/<path> URLs because the bucket
-- itself is public; only the enumeration/list API is closed.
DROP POLICY IF EXISTS "Public read review photos" ON storage.objects;