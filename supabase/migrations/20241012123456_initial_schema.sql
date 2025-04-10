-- migration: initial schema creation
-- created: 2024-10-12 12:34:56 utc
-- description: create tables and types for task management system including tables task, user_context, and processing_log with appropriate row level security policies
-- note: this migration creates enum types, tables, and applies row level security policies following supabase best practices

create type task_category as enum ('a','b','c');

create type task_source as enum ('full-ai','edited-ai','edited-user');

create table task (
    id serial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    priority bigint not null,
    category task_category not null,
    task_source task_source not null,
    description varchar(2000) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    completed_at timestamptz
);

alter table task enable row level security;

create policy task_select_policy on task
    for select
    using (user_id = current_setting('app.current_user_id')::uuid);

create policy task_insert_policy on task
    for insert
    with check (user_id = current_setting('app.current_user_id')::uuid);

create policy task_update_policy on task
    for update
    using (user_id = current_setting('app.current_user_id')::uuid)
    with check (user_id = current_setting('app.current_user_id')::uuid);

create policy task_delete_policy on task
    for delete
    using (user_id = current_setting('app.current_user_id')::uuid);

create table user_context (
    user_id uuid primary key references auth.users(id) on delete cascade,
    context_data varchar(5000) not null
);

alter table user_context enable row level security;

create policy user_context_select_policy on user_context
    for select
    using (user_id = current_setting('app.current_user_id')::uuid);

create policy user_context_insert_policy on user_context
    for insert
    with check (user_id = current_setting('app.current_user_id')::uuid);

create policy user_context_update_policy on user_context
    for update
    using (user_id = current_setting('app.current_user_id')::uuid)
    with check (user_id = current_setting('app.current_user_id')::uuid);

create policy user_context_delete_policy on user_context
    for delete
    using (user_id = current_setting('app.current_user_id')::uuid);

create table processing_log (
    id serial primary key,
    task_id integer not null references task(id) on delete no action,
    user_id uuid not null references auth.users(id) on delete cascade,
    processing_time bigint not null, -- processing time in milliseconds
    status int not null, -- status of the log
    error_message text, -- detailed error message if any
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table processing_log enable row level security;

create policy processing_log_select_policy on processing_log
    for select
    using (
        current_setting('app.current_user_role') in ('admin','dev')
        or user_id = current_setting('app.current_user_id')::uuid
    );

create policy processing_log_insert_policy on processing_log
    for insert
    with check (
        current_setting('app.current_user_role') in ('admin','dev')
        or user_id = current_setting('app.current_user_id')::uuid
    );

create policy processing_log_update_policy on processing_log
    for update
    using (
        current_setting('app.current_user_role') in ('admin','dev')
        or user_id = current_setting('app.current_user_id')::uuid
    )
    with check (
        current_setting('app.current_user_role') in ('admin','dev')
        or user_id = current_setting('app.current_user_id')::uuid
    );

create policy processing_log_delete_policy on processing_log
    for delete
    using (
        current_setting('app.current_user_role') in ('admin','dev')
        or user_id = current_setting('app.current_user_id')::uuid
    );

-- temporary: disable row level security for testing purposes
alter table task disable row level security;
alter table user_context disable row level security;
alter table processing_log disable row level security; 