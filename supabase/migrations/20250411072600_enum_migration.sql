-- migration: enum migration
-- created: 2025-04-11 07:26:00 utc
-- description: rename enum values to uppercase
-- note: this migration creates enum types, tables, and applies row level security policies following supabase best practices

alter type task_category rename value 'a' to 'A';
alter type task_category rename value 'b' to 'B';
alter type task_category rename value 'c' to 'C';
