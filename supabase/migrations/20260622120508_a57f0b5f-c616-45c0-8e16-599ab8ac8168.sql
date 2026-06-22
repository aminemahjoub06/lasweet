SELECT pgmq.purge_queue('transactional_emails_dlq');
SELECT pgmq.purge_queue('transactional_emails');