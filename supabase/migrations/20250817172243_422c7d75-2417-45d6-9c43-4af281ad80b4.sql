-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- USERS are managed by Supabase auth.users; create a profile table linked by auth.uid()
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  plan text default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  genre text,
  template text,
  goal_words int,
  status text check (status in ('active','finished','archived')) default 'active',
  cover_image_url text,
  synopsis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  idx int not null default 0,
  title text not null,
  content text not null default '',
  word_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.characters (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  role text,
  appearance text,
  goals text,
  backstory text,
  relationships text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.world_notes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type text check (type in ('location','rule','timeline','other')) default 'other',
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type text check (type in ('cover','illustration')) not null,
  url text not null,
  prompt text,
  created_at timestamptz not null default now()
);

-- Premium + POD scaffolding
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text default 'stripe',
  plan text check (plan in ('free','premium')) not null default 'free',
  status text check (status in ('active','trialing','past_due','canceled')) not null default 'active',
  current_period_end timestamptz
);

create table if not exists public.print_credits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text check (status in ('available','redeemed','expired')) not null default 'available',
  redeemed_order_id uuid
);

create table if not exists public.print_orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  spec jsonb not null,
  quote jsonb,
  status text check (status in ('created','submitted','in_production','shipped','canceled','error')) not null default 'created',
  provider_order_id text,
  tracking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  credit_redemption_id uuid
);

-- Usage/rate limits (e.g., AI calls/day)
create table if not exists public.usage_ai (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  calls int not null default 0,
  tokens int not null default 0,
  constraint uniq_usage_ai unique (user_id, day)
);

-- Triggers
create or replace function public.update_timestamp() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create or replace function public.word_count_of(text) returns int as $$
  select coalesce(array_length(regexp_split_to_array(trim($1), '\s+'), 1), 0);
$$ language sql immutable;

create or replace function public.refresh_chapter_word_count() returns trigger as $$
begin
  new.word_count = public.word_count_of(new.content);
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute procedure public.update_timestamp();

create trigger chapters_word_count
  before insert or update of content on public.chapters
  for each row execute procedure public.refresh_chapter_word_count();

-- RLS Policies (strict, least privilege)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.chapters enable row level security;
alter table public.characters enable row level security;
alter table public.world_notes enable row level security;
alter table public.assets enable row level security;
alter table public.subscriptions enable row level security;
alter table public.print_credits enable row level security;
alter table public.print_orders enable row level security;
alter table public.usage_ai enable row level security;

-- Helpers
create or replace function public.is_owner(uid uuid, pid uuid) returns boolean as $$
  select exists(
    select 1 from public.projects p
    where p.id = pid and p.user_id = uid
  );
$$ language sql stable;

-- profiles: each user can read/update their own profile
create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_upsert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

-- projects: owner only
create policy "projects_owner_select" on public.projects for select using (auth.uid() = user_id);
create policy "projects_owner_cud" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- chapters/characters/world_notes/assets: only via owning project
create policy "chapters_by_owner" on public.chapters for all using (public.is_owner(auth.uid(), project_id)) with check (public.is_owner(auth.uid(), project_id));
create policy "characters_by_owner" on public.characters for all using (public.is_owner(auth.uid(), project_id)) with check (public.is_owner(auth.uid(), project_id));
create policy "world_notes_by_owner" on public.world_notes for all using (public.is_owner(auth.uid(), project_id)) with check (public.is_owner(auth.uid(), project_id));
create policy "assets_by_owner" on public.assets for all using (public.is_owner(auth.uid(), project_id)) with check (public.is_owner(auth.uid(), project_id));

-- subscriptions & credits & orders: per owner
create policy "subscriptions_self" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "print_credits_self" on public.print_credits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "print_orders_self" on public.print_orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- usage_ai: per owner (insert/update your own daily row)
create policy "usage_ai_self" on public.usage_ai for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage buckets
insert into storage.buckets (id, name, public) values 
  ('covers', 'covers', true),
  ('illustrations', 'illustrations', true),
  ('exports', 'exports', false);

-- Storage policies for covers (public read, owner write)
create policy "covers_public_read" on storage.objects for select using (bucket_id = 'covers');
create policy "covers_owner_write" on storage.objects for insert with check (
  bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "covers_owner_update" on storage.objects for update using (
  bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "covers_owner_delete" on storage.objects for delete using (
  bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for illustrations (public read, owner write)
create policy "illustrations_public_read" on storage.objects for select using (bucket_id = 'illustrations');
create policy "illustrations_owner_write" on storage.objects for insert with check (
  bucket_id = 'illustrations' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "illustrations_owner_update" on storage.objects for update using (
  bucket_id = 'illustrations' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "illustrations_owner_delete" on storage.objects for delete using (
  bucket_id = 'illustrations' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for exports (private - owner only)
create policy "exports_owner_read" on storage.objects for select using (
  bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "exports_owner_write" on storage.objects for insert with check (
  bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "exports_owner_update" on storage.objects for update using (
  bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "exports_owner_delete" on storage.objects for delete using (
  bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();