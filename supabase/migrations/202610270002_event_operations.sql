-- Chaveamento eliminatório e central de operações do evento.

create table public.bracket_ties (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  stage text not null check (stage in ('round-of-16', 'quarterfinal', 'semifinal', 'final')),
  tie_order smallint not null check (tie_order between 1 and 16),
  home_team_id uuid references public.teams(id) on delete set null,
  away_team_id uuid references public.teams(id) on delete set null,
  first_leg_home smallint check (first_leg_home is null or first_leg_home >= 0),
  first_leg_away smallint check (first_leg_away is null or first_leg_away >= 0),
  second_leg_home smallint check (second_leg_home is null or second_leg_home >= 0),
  second_leg_away smallint check (second_leg_away is null or second_leg_away >= 0),
  winner_id uuid references public.teams(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (classroom_id, stage, tie_order),
  check (home_team_id is null or away_team_id is null or home_team_id <> away_team_id)
);

create table public.event_tasks (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  category text not null check (category in ('estrutura', 'arbitragem', 'comunicação', 'saúde')),
  due_time time not null,
  done boolean not null default false,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 60),
  message text not null check (char_length(message) between 3 and 240),
  priority text not null default 'normal' check (priority in ('normal', 'important', 'urgent')),
  created_at timestamptz not null default now()
);

create table public.event_incidents (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  reported_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 100),
  location text not null check (char_length(location) between 2 and 60),
  severity text not null default 'low' check (severity in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index bracket_classroom_stage_idx on public.bracket_ties(classroom_id, stage, tie_order);
create index event_tasks_classroom_idx on public.event_tasks(classroom_id, due_time);
create index announcements_classroom_created_idx on public.announcements(classroom_id, created_at desc);
create index event_incidents_classroom_status_idx on public.event_incidents(classroom_id, status, created_at desc);

create trigger bracket_ties_updated_at before update on public.bracket_ties for each row execute function public.set_updated_at();
create trigger event_tasks_updated_at before update on public.event_tasks for each row execute function public.set_updated_at();

alter table public.bracket_ties enable row level security;
alter table public.event_tasks enable row level security;
alter table public.announcements enable row level security;
alter table public.event_incidents enable row level security;

create policy "members read bracket" on public.bracket_ties for select to authenticated using (public.is_classroom_member(classroom_id));
create policy "representatives manage bracket" on public.bracket_ties for all to authenticated using (public.is_classroom_representative(classroom_id)) with check (public.is_classroom_representative(classroom_id));
create policy "members read event tasks" on public.event_tasks for select to authenticated using (public.is_classroom_member(classroom_id));
create policy "representatives manage event tasks" on public.event_tasks for all to authenticated using (public.is_classroom_representative(classroom_id)) with check (public.is_classroom_representative(classroom_id));
create policy "members read announcements" on public.announcements for select to authenticated using (public.is_classroom_member(classroom_id));
create policy "representatives publish announcements" on public.announcements for insert to authenticated with check (public.is_classroom_representative(classroom_id) and author_id = auth.uid());
create policy "representatives update announcements" on public.announcements for update to authenticated using (public.is_classroom_representative(classroom_id)) with check (public.is_classroom_representative(classroom_id));
create policy "representatives delete announcements" on public.announcements for delete to authenticated using (public.is_classroom_representative(classroom_id));
create policy "members read incidents" on public.event_incidents for select to authenticated using (public.is_classroom_member(classroom_id));
create policy "representatives create incidents" on public.event_incidents for insert to authenticated with check (public.is_classroom_representative(classroom_id) and reported_by = auth.uid());
create policy "representatives update incidents" on public.event_incidents for update to authenticated using (public.is_classroom_representative(classroom_id)) with check (public.is_classroom_representative(classroom_id));

create or replace view public.bracket_overview with (security_invoker = true) as
select bt.id, bt.classroom_id, bt.stage,
  case bt.stage when 'round-of-16' then 1 when 'quarterfinal' then 2 when 'semifinal' then 3 else 4 end stage_order,
  bt.tie_order,
  coalesce(ht.name, 'A definir') home_team, coalesce(ht.color, '#53625c') home_color,
  coalesce(at.name, 'A definir') away_team, coalesce(at.color, '#53625c') away_color,
  bt.first_leg_home, bt.first_leg_away, bt.second_leg_home, bt.second_leg_away,
  wt.name winner
from public.bracket_ties bt
left join public.teams ht on ht.id = bt.home_team_id
left join public.teams at on at.id = bt.away_team_id
left join public.teams wt on wt.id = bt.winner_id;

grant select on public.bracket_overview to authenticated;
