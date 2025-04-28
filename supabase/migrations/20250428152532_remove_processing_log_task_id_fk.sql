-- migration: remove foreign key constraint on processing_log.task_id
-- created: 2025-04-28 15:25:32 utc
-- description: removes the foreign key constraint from processing_log.task_id to task(id)
-- special considerations: this is a destructive operation; ensure no application logic depends on this constraint

-- Step 1: Drop the foreign key constraint on processing_log.task_id
-- WARNING: This is a destructive operation. After this migration, processing_log.task_id will no longer be validated against task(id).
-- If there is existing data that relies on this relationship, review application logic and data integrity before applying.

alter table processing_log drop constraint if exists processing_log_task_id_fkey;

-- No further changes. The column task_id remains, but is no longer a foreign key. 