create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.reports (
  id text primary key,
  date date not null,
  type text not null check (type in ('daily_pre_market', 'weekly_watch', 'market_closed')),
  published_at timestamptz not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_date_idx on public.reports (date desc);
create index if not exists reports_type_idx on public.reports (type);
create index if not exists reports_payload_gin_idx on public.reports using gin (payload);

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
before update on public.reports
for each row
execute function public.set_updated_at();

alter table public.reports enable row level security;

drop policy if exists "reports are publicly readable" on public.reports;
create policy "reports are publicly readable"
on public.reports
for select
using (true);

create table if not exists public.report_feedback (
  id uuid primary key default gen_random_uuid(),
  report_id text not null references public.reports (id) on delete cascade,
  anonymous_key text not null,
  feedback text not null check (feedback in ('helpful', 'unclear')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, anonymous_key)
);

create index if not exists report_feedback_report_id_idx on public.report_feedback (report_id);
create index if not exists report_feedback_feedback_idx on public.report_feedback (feedback);

drop trigger if exists set_report_feedback_updated_at on public.report_feedback;
create trigger set_report_feedback_updated_at
before update on public.report_feedback
for each row
execute function public.set_updated_at();

alter table public.report_feedback enable row level security;

drop policy if exists "feedback is publicly readable" on public.report_feedback;
create policy "feedback is publicly readable"
on public.report_feedback
for select
using (true);

drop policy if exists "anonymous users can submit feedback" on public.report_feedback;
create policy "anonymous users can submit feedback"
on public.report_feedback
for insert
with check (
  anonymous_key <> ''
  and feedback in ('helpful', 'unclear')
);

drop policy if exists "anonymous users can update own feedback" on public.report_feedback;
create policy "anonymous users can update own feedback"
on public.report_feedback
for update
using (anonymous_key <> '')
with check (
  anonymous_key <> ''
  and feedback in ('helpful', 'unclear')
);
