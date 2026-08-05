-- Concert Savings goals and deposit history

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  concert_name text not null,
  target_amount numeric not null check (target_amount > 0),
  target_date date not null,
  starting_saved numeric not null default 0 check (starting_saved >= 0),
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.savings_goals (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric not null check (amount > 0),
  contributed_on date not null default (timezone('utc', now()))::date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists savings_goals_user_id_idx on public.savings_goals (user_id);
create index if not exists savings_goals_status_idx on public.savings_goals (user_id, status);
create index if not exists savings_contributions_goal_id_idx on public.savings_contributions (goal_id);
create index if not exists savings_contributions_user_id_idx on public.savings_contributions (user_id);

alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;

create policy "Users can view their own savings goals"
  on public.savings_goals for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own savings goals"
  on public.savings_goals for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own savings goals"
  on public.savings_goals for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view their own savings contributions"
  on public.savings_contributions for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own savings contributions"
  on public.savings_contributions for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.savings_goals g
      where g.id = goal_id and g.user_id = auth.uid()
    )
  );

revoke all on table public.savings_goals from anon;
revoke all on table public.savings_contributions from anon;
grant select, insert, update on table public.savings_goals to authenticated;
grant select, insert on table public.savings_contributions to authenticated;
