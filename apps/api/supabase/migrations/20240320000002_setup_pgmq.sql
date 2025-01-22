-- Enable pgmq extension
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create queues for different operations
SELECT pgmq.create('scraping_queue');
SELECT pgmq.create('analysis_queue');

-- Create view for monitoring queues
CREATE VIEW queue_stats AS
SELECT 
    queue_name,
    (SELECT COUNT(*) FROM pgmq.get_queue(queue_name)) as total_messages,
    (SELECT COUNT(*) FROM pgmq.get_dlq(queue_name)) as dead_letters
FROM pgmq.list_queues(); 