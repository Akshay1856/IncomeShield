-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Experience embeddings table for semantic search and hindsight learning
CREATE TABLE IF NOT EXISTS public.experience_embeddings (
  id uuid primary key default gen_random_uuid(),
  experience_id text not null references public.ai_experiences(id) on delete cascade,
  event_type text not null check (event_type in ('pricing', 'trigger', 'fraud', 'payout', 'retention')),
  embedding vector(1536) not null,
  context jsonb not null default '{}',
  summary text not null,
  location_coordinates point,
  area_code text,
  weather_condition text,
  traffic_level text,
  disruption_type text,
  severity_score numeric(3,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experience_embeddings_event_type_idx on public.experience_embeddings (event_type);
create index if not exists experience_embeddings_area_code_idx on public.experience_embeddings (area_code);
create index if not exists experience_embeddings_embedding_idx on public.experience_embeddings using ivfflat (embedding vector_cosine_ops);
create index if not exists experience_embeddings_created_at_idx on public.experience_embeddings (created_at desc);

alter table public.experience_embeddings enable row level security;

-- Chat history table for multi-turn conversations
CREATE TABLE IF NOT EXISTS public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  session_id uuid not null default gen_random_uuid(),
  agent_type text not null check (agent_type in ('risk_assessment', 'claims_support', 'general_faq', 'hindsight_learning')),
  user_message text not null,
  assistant_response text not null,
  context_embeddings vector(1536),
  relevant_experiences text[] default '{}',
  feedback_score numeric(2,1),
  created_at timestamptz not null default now()
);

create index if not exists chat_history_user_id_idx on public.chat_history (user_id);
create index if not exists chat_history_session_id_idx on public.chat_history (session_id);
create index if not exists chat_history_agent_type_idx on public.chat_history (agent_type);
create index if not exists chat_history_created_at_idx on public.chat_history (created_at desc);

alter table public.chat_history enable row level security;

-- Area risk scores table for dynamic risk calculation
CREATE TABLE IF NOT EXISTS public.area_risk_scores (
  id uuid primary key default gen_random_uuid(),
  area_code text not null unique,
  area_name text not null,
  location_coordinates point,
  risk_score numeric(5,2) not null default 0.0,
  risk_level text not null default 'low' check (risk_level in ('low', 'medium', 'high', 'critical')),
  disruption_count integer default 0,
  claims_count integer default 0,
  fraud_incidents integer default 0,
  avg_payout_amount numeric default 0,
  weather_risk_factor numeric(3,2) default 0,
  traffic_risk_factor numeric(3,2) default 0,
  last_updated timestamptz not null default now(),
  updated_by text,
  created_at timestamptz not null default now()
);

create index if not exists area_risk_scores_risk_score_idx on public.area_risk_scores (risk_score desc);
create index if not exists area_risk_scores_risk_level_idx on public.area_risk_scores (risk_level);
create index if not exists area_risk_scores_location_idx on public.area_risk_scores using gist(location_coordinates);

alter table public.area_risk_scores enable row level security;

-- Extended notifications table with area context
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  notification_type text not null check (notification_type in ('risk_alert', 'claim_update', 'general', 'weather_warning', 'fraud_alert', 'area_alert')),
  title text not null,
  message text not null,
  area_code text references public.area_risk_scores(area_code) on delete set null,
  risk_level text,
  related_experience_id text,
  is_read boolean default false,
  action_url text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_notification_type_idx on public.notifications (notification_type);
create index if not exists notifications_is_read_idx on public.notifications (is_read);
create index if not exists notifications_area_code_idx on public.notifications (area_code);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;

-- Risk score history for tracking changes over time
CREATE TABLE IF NOT EXISTS public.risk_score_history (
  id uuid primary key default gen_random_uuid(),
  area_code text not null references public.area_risk_scores(area_code) on delete cascade,
  risk_score_previous numeric(5,2) not null,
  risk_score_new numeric(5,2) not null,
  risk_level_previous text not null,
  risk_level_new text not null,
  change_reason text,
  contributing_factors jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists risk_score_history_area_code_idx on public.risk_score_history (area_code);
create index if not exists risk_score_history_created_at_idx on public.risk_score_history (created_at desc);

alter table public.risk_score_history enable row level security;

-- Chatbot agent performance metrics
CREATE TABLE IF NOT EXISTS public.agent_metrics (
  id uuid primary key default gen_random_uuid(),
  agent_type text not null check (agent_type in ('risk_assessment', 'claims_support', 'general_faq', 'hindsight_learning')),
  total_interactions integer default 0,
  avg_user_satisfaction numeric(3,2) default 0,
  avg_response_time_ms integer default 0,
  most_common_topics text[] default '{}',
  improvement_rate numeric(5,2) default 0,
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists agent_metrics_agent_type_idx on public.agent_metrics (agent_type);

alter table public.agent_metrics enable row level security;

-- RLS Policies
create policy "Users can view their own chat history" on public.chat_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own chat history" on public.chat_history
  for insert with check (auth.uid() = user_id);

create policy "Users can view notifications for their areas" on public.notifications
  for select using (auth.uid() = user_id or auth.role() = 'service_role');

create policy "Users can mark their notifications as read" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Anyone can view area risk scores" on public.area_risk_scores
  for select using (true);

create policy "Service role can update area risk scores" on public.area_risk_scores
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Anyone can view experience embeddings" on public.experience_embeddings
  for select using (true);

create policy "Anyone can view agent metrics" on public.agent_metrics
  for select using (true);
