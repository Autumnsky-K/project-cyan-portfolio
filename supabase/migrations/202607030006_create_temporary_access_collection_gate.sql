create table if not exists public.customer_access_collection_gate (
  gate_id boolean primary key default true,
  started_at timestamptz not null default now(),
  window_seconds integer not null default 600,
  limit_count integer not null default 50,
  accepted_count integer not null default 0,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint customer_access_collection_gate_singleton check (gate_id)
);

insert into public.customer_access_collection_gate
  (gate_id, started_at, window_seconds, limit_count, accepted_count, enabled, updated_at)
values
  (true, now(), 600, 50, 0, true, now())
on conflict (gate_id) do update set
  started_at = excluded.started_at,
  window_seconds = excluded.window_seconds,
  limit_count = excluded.limit_count,
  accepted_count = 0,
  enabled = true,
  updated_at = excluded.updated_at;

create or replace function public.project_cyan_temporary_collection_gate()
returns trigger
language plpgsql
as $$
declare
  gate public.customer_access_collection_gate%rowtype;
begin
  select *
    into gate
    from public.customer_access_collection_gate
   where gate_id = true
   for update;

  if not found or not gate.enabled then
    return new;
  end if;

  if now() >= gate.started_at + make_interval(secs => gate.window_seconds) then
    return null;
  end if;

  if gate.accepted_count >= gate.limit_count then
    return null;
  end if;

  update public.customer_access_collection_gate
     set accepted_count = accepted_count + 1,
         updated_at = now()
   where gate_id = true;

  return new;
end;
$$;

drop trigger if exists trg_customer_access_log_temporary_collection_gate
  on public.customer_access_log;

create trigger trg_customer_access_log_temporary_collection_gate
before insert on public.customer_access_log
for each row
execute function public.project_cyan_temporary_collection_gate();

drop trigger if exists trg_security_event_temporary_collection_gate
  on public.security_event;

create trigger trg_security_event_temporary_collection_gate
before insert on public.security_event
for each row
execute function public.project_cyan_temporary_collection_gate();

comment on table public.customer_access_collection_gate is 'Temporary Project Cyan monitoring collection gate. Reset or remove before enabling permanent analytics.';
