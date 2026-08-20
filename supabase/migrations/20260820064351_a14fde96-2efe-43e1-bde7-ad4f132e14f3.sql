select cron.schedule(
  'expire-order-requests',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--9d9470e8-0b4c-4b69-ac18-7ec8769340c6.lovable.app/api/public/hooks/expire-order-requests',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);