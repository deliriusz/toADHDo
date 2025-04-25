-- supabase/migrations/20240711145500_change_priority_to_lexorank.sql

-- migration: change priority column type in task table from bigint → varchar(255)
-- purpose: support lexorank strings ("bucket|rank:marker") instead of numeric priorities
-- affected tables: task
-- special considerations: applications must be updated to use lexorank strings for priorities

begin;

-- add a new varchar column to hold lexorank keys
-- using varchar(255) which should be sufficient for lexorank format "bucket|rank:marker"
alter table task
  add column new_priority varchar(255);

-- backfill new_priority with existing numeric priorities converted to lexorank format
-- this is a simple conversion that just puts numbers in bucket 0 with empty marker
-- format: "0|<priority>:1"
update task
  set new_priority = concat('0|', priority::text, ':1');

-- enforce not-null constraint to maintain data integrity
alter table task
  alter column new_priority set not null;

-- drop the old bigint priority column
-- CAUTION: this is a destructive action - all application code must now use the new string format
alter table task
  drop column priority;

-- rename new_priority to priority to maintain backward compatibility with application code
alter table task
  rename column new_priority to priority;

-- comment on the column to document the lexorank format
comment on column task.priority is 'LexoRank string with format "bucket|rank:marker" for efficient task ordering';

commit;