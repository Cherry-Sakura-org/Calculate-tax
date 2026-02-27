-- Spring Batch 6.0 Migration: Rename sequence
-- BATCH_JOB_SEQ -> BATCH_JOB_INSTANCE_SEQ

-- For PostgreSQL
ALTER SEQUENCE IF EXISTS BATCH_JOB_SEQ RENAME TO BATCH_JOB_INSTANCE_SEQ;

-- If the sequence doesn't exist with the old name, this is likely a fresh install
-- and the correct sequence name will be created by Spring Batch 6
