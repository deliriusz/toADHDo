-- 20241002120000_create_initial_schema.sql
-- purpose: create initial schema for the application
-- affected tables: task, user_context, processing_log
-- this migration creates the enum types, tables, indexes, enables row level security, and creates granular policies for each operation (select, insert, update, delete) for roles anon and authenticated.
-- all sql is written in lowercase as per guidelines

-- create enum types
create type task_category as enum ('a', 'b', 'c');
create type task_source as enum ('full-ai', 'edited-ai', 'edited-user');

-- create table task
create table task (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  priority bigint not null,
  category task_category not null,
  task_source task_source not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- enable row level security on task
alter table task enable row level security;

-- create policies for task table for role anon
create policy task_select_anon on task for select to anon using (user_id = current_setting('app.current_user_id')::uuid);
create policy task_insert_anon on task for insert to anon with check (user_id = current_setting('app.current_user_id')::uuid);
create policy task_update_anon on task for update to anon using (user_id = current_setting('app.current_user_id')::uuid);
create policy task_delete_anon on task for delete to anon using (user_id = current_setting('app.current_user_id')::uuid);

-- create policies for task table for role authenticated
create policy task_select_auth on task for select to authenticated using (user_id = current_setting('app.current_user_id')::uuid);
create policy task_insert_auth on task for insert to authenticated with check (user_id = current_setting('app.current_user_id')::uuid);
create policy task_update_auth on task for update to authenticated using (user_id = current_setting('app.current_user_id')::uuid);
create policy task_delete_auth on task for delete to authenticated using (user_id = current_setting('app.current_user_id')::uuid);

-- create index on task(user_id)
create index idx_task_user_id on task(user_id);

-- create table user_context
create table user_context (
  user_id uuid primary key references auth.users(id) on delete cascade,
  context_data text
);

-- enable row level security on user_context
alter table user_context enable row level security;

-- create policies for user_context for role anon
create policy user_context_select_anon on user_context for select to anon using (user_id = current_setting('app.current_user_id')::uuid);
create policy user_context_insert_anon on user_context for insert to anon with check (user_id = current_setting('app.current_user_id')::uuid);
create policy user_context_update_anon on user_context for update to anon using (user_id = current_setting('app.current_user_id')::uuid);
create policy user_context_delete_anon on user_context for delete to anon using (user_id = current_setting('app.current_user_id')::uuid);

-- create policies for user_context for role authenticated
create policy user_context_select_auth on user_context for select to authenticated using (user_id = current_setting('app.current_user_id')::uuid);
create policy user_context_insert_auth on user_context for insert to authenticated with check (user_id = current_setting('app.current_user_id')::uuid);
create policy user_context_update_auth on user_context for update to authenticated using (user_id = current_setting('app.current_user_id')::uuid);
create policy user_context_delete_auth on user_context for delete to authenticated using (user_id = current_setting('app.current_user_id')::uuid);

-- create table processing_log
create table processing_log (
  id serial primary key,
  task_id integer not null references task(id) on delete no action,
  user_id uuid not null references auth.users(id) on delete cascade,
  processing_time bigint not null,  -- processing time in milliseconds
  message_length int not null,  -- processing time in milliseconds
  message_hash text not null,  -- processing time in milliseconds
  status boolean not null,            -- status of processing
  error_message text,              -- error messages if any
  created_at timestamptz not null default now()
);

-- enable row level security on processing_log
alter table processing_log enable row level security;

-- create policies for processing_log for role anon
create policy processing_log_select_anon on processing_log for select to anon using (current_setting('app.current_user_role') in ('admin','dev') or user_id = current_setting('app.current_user_id')::uuid);
create policy processing_log_insert_anon on processing_log for insert to anon with check (current_setting('app.current_user_role') in ('admin','dev') or user_id = current_setting('app.current_user_id')::uuid);
create policy processing_log_update_anon on processing_log for update to anon using (current_setting('app.current_user_role') in ('admin','dev') or user_id = current_setting('app.current_user_id')::uuid);
create policy processing_log_delete_anon on processing_log for delete to anon using (current_setting('app.current_user_role') in ('admin','dev') or user_id = current_setting('app.current_user_id')::uuid);

-- create policies for processing_log for role authenticated
create policy processing_log_select_auth on processing_log for select to authenticated using (current_setting('app.current_user_role') in ('admin','dev') or user_id = current_setting('app.current_user_id')::uuid);
create policy processing_log_insert_auth on processing_log for insert to authenticated with check (current_setting('app.current_user_role') in ('admin','dev') or user_id = current_setting('app.current_user_id')::uuid);
create policy processing_log_update_auth on processing_log for update to authenticated using (current_setting('app.current_user_role') in ('admin','dev') or user_id = current_setting('app.current_user_id')::uuid);
create policy processing_log_delete_auth on processing_log for delete to authenticated using (current_setting('app.current_user_role') in ('admin','dev') or user_id = current_setting('app.current_user_id')::uuid);

-- create indexes on processing_log
create index idx_processing_log_task_id on processing_log(task_id);
create index idx_processing_log_user_id on processing_log(user_id); 