-- Concert Cost Tracker: concerts table with Row Level Security
-- Each logged-in user can only insert and view their own concerts.

create table if not exists public.concerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  concert_name text not null,
  artist text not null,
  venue text not null,
  city text not null,
  state text not null,
  concert_date date not null,
  distance_from_home numeric not null default 0,
  hours_at_event numeric not null default 0,
  ticket_cost numeric not null default 0,
  ticket_fees numeric not null default 0,
  parking_cost numeric not null default 0,
  food_drink_cost numeric not null default 0,
  merchandise_cost numeric not null default 0,
  lodging_cost numeric not null default 0,
  travel_cost numeric not null default 0,
  other_cost numeric not null default 0,
  fun_rating integer not null check (fun_rating between 1 and 10),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists concerts_user_id_idx on public.concerts (user_id);
create index if not exists concerts_concert_date_idx on public.concerts (concert_date desc);

alter table public.concerts enable row level security;

drop policy if exists "Users can view their own concerts" on public.concerts;
create policy "Users can view their own concerts"
  on public.concerts
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own concerts" on public.concerts;
create policy "Users can insert their own concerts"
  on public.concerts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

revoke all on table public.concerts from anon;
grant select, insert on table public.concerts to authenticated;
