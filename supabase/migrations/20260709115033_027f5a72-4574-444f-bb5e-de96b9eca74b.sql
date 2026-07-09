
CREATE POLICY "Public read review photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-photos');

CREATE POLICY "Service role write review photos"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'review-photos');

CREATE POLICY "Service role delete review photos"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'review-photos');
