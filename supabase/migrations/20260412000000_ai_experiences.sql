-- Optional: sync Experience Memory Store from the AI service into Supabase (prototype schema).
create table if not exists public.ai_experiences (
  id text primary key,
  event_type text not null check (event_type in ('pricing', 'trigger', 'fraud', 'payout', 'retention')),
  inputs jsonb not null default '{}',
  decision jsonb not null default '{}',
  outcome jsonb not null default '{}',
  user_response text,
  fraud_status text,
  financial_result_inr numeric,
  decision_was_good boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists ai_experiences_event_type_idx on public.ai_experiences (event_type);
create index if not exists ai_experiences_created_at_idx on public.ai_experiences (created_at desc);

alter table public.ai_experiences enable row level security;
