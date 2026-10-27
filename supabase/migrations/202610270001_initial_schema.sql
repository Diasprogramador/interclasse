-- Arena Escolar — schema inicial
-- Execute no SQL Editor do Supabase ou com `supabase db push`.

create extension if not exists pgcrypto;

create type public.member_role as enum ('captain', 'player');
create type public.invitation_status as enum ('pending', 'accepted', 'declined', 'cancelled');
create type public.match_status as enum ('scheduled', 'live', 'finished', 'cancelled');
create type public.app_theme as enum ('dark', 'light', 'system');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique check (nickname ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null check (char_length(display_name) between 3 and 80),
  class_grade text,
  theme public.app_theme not null default 'dark',
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 80),
  grade text not null check (char_length(grade) between 1 and 20),
  invite_code text not null unique check (invite_code ~ '^[A-Z0-9]{6,12}$'),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classroom_members (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  is_representative boolean not null default false,
  created_at timestamptz not null default now(),
  unique (classroom_id, user_id)
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  captain_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 32),
  short_name text not null check (char_length(short_name) between 1 and 4),
  color text not null default '#4e8cd8' check (color ~ '^#[0-9a-fA-F]{6}$'),
  mascot text not null default '' check (char_length(mascot) <= 24),
  bio text not null default '' check (char_length(bio) <= 140),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (classroom_id, name),
  unique (classroom_id, short_name)
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  number smallint not null default 0 check (number between 0 and 99),
  position text not null default 'A definir' check (char_length(position) <= 24),
  role public.member_role not null default 'player',
  created_at timestamptz not null default now(),
  unique (team_id, user_id),
  unique (team_id, number) deferrable initially deferred
);

create table public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  status public.invitation_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (team_id, recipient_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  sport text not null check (char_length(sport) between 2 and 32),
  starts_at timestamptz not null,
  venue text not null check (char_length(venue) between 2 and 60),
  status public.match_status not null default 'scheduled',
  home_team_id uuid not null references public.teams(id) on delete restrict,
  away_team_id uuid not null references public.teams(id) on delete restrict,
  home_score smallint check (home_score is null or home_score >= 0),
  away_score smallint check (away_score is null or away_score >= 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_team_id <> away_team_id),
  check ((status in ('scheduled', 'cancelled')) or (home_score is not null and away_score is not null))
);

create table public.player_match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  goals smallint not null default 0 check (goals >= 0),
  assists smallint not null default 0 check (assists >= 0),
  yellow_cards smallint not null default 0 check (yellow_cards >= 0),
  red_cards smallint not null default 0 check (red_cards >= 0),
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create index classroom_members_classroom_idx on public.classroom_members(classroom_id);
create index teams_classroom_idx on public.teams(classroom_id);
create index team_members_team_idx on public.team_members(team_id);
create index team_invitations_recipient_idx on public.team_invitations(recipient_id, status);
create index matches_classroom_starts_idx on public.matches(classroom_id, starts_at);
create index player_stats_team_idx on public.player_match_stats(team_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger classrooms_updated_at before update on public.classrooms for each row execute function public.set_updated_at();
create trigger teams_updated_at before update on public.teams for each row execute function public.set_updated_at();
create trigger matches_updated_at before update on public.matches for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare base_nickname text;
begin
  base_nickname := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'nickname', split_part(new.email, '@', 1)), '[^a-zA-Z0-9_]', '', 'g'));
  if char_length(base_nickname) < 3 then base_nickname := 'jogador'; end if;
  insert into public.profiles (id, nickname, display_name)
  values (
    new.id,
    left(base_nickname, 14) || case when exists(select 1 from public.profiles where nickname = left(base_nickname, 20)) then '_' || substr(new.id::text, 1, 5) else '' end,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'Novo jogador')
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.current_classroom_id()
returns uuid language sql stable security definer set search_path = public
as $$ select classroom_id from public.classroom_members where user_id = auth.uid() limit 1 $$;

create or replace function public.is_classroom_member(target_classroom uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.classroom_members where classroom_id = target_classroom and user_id = auth.uid()) $$;

create or replace function public.is_classroom_representative(target_classroom uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.classroom_members where classroom_id = target_classroom and user_id = auth.uid() and is_representative) $$;

create or replace function public.is_team_captain(target_team uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.teams where id = target_team and captain_id = auth.uid()) $$;

create or replace function public.enforce_team_capacity()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.team_members where team_id = new.team_id) >= 12 then
    raise exception 'O time já atingiu o limite de 12 jogadores.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger team_capacity before insert on public.team_members for each row execute function public.enforce_team_capacity();

create or replace function public.create_classroom_with_owner(classroom_name text, classroom_grade text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare new_id uuid; new_code text;
begin
  if auth.uid() is null then raise exception 'Autenticação necessária.'; end if;
  if exists(select 1 from classroom_members where user_id = auth.uid()) then raise exception 'Você já pertence a uma sala.'; end if;
  new_code := 'AR' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
  insert into classrooms(name, grade, invite_code, owner_id) values(trim(classroom_name), trim(classroom_grade), new_code, auth.uid()) returning id into new_id;
  insert into classroom_members(classroom_id, user_id, is_representative) values(new_id, auth.uid(), true);
  update profiles set class_grade = trim(classroom_grade) where id = auth.uid();
  return new_id;
end;
$$;

create or replace function public.join_classroom_by_code(code_input text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare target_id uuid; target_grade text;
begin
  if auth.uid() is null then raise exception 'Autenticação necessária.'; end if;
  if exists(select 1 from classroom_members where user_id = auth.uid()) then raise exception 'Você já pertence a uma sala.'; end if;
  select id, grade into target_id, target_grade from classrooms where invite_code = upper(trim(code_input));
  if target_id is null then raise exception 'Código de sala inválido.'; end if;
  insert into classroom_members(classroom_id, user_id) values(target_id, auth.uid());
  update profiles set class_grade = target_grade where id = auth.uid();
  return target_id;
end;
$$;

create or replace function public.create_team_with_captain(team_name text, team_short_name text, team_color text, team_mascot text, team_bio text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare target_classroom uuid; new_team uuid;
begin
  target_classroom := current_classroom_id();
  if target_classroom is null then raise exception 'Entre em uma sala antes de criar um time.'; end if;
  if exists(select 1 from team_members where user_id = auth.uid()) then raise exception 'Você já pertence a um time.'; end if;
  insert into teams(classroom_id, captain_id, name, short_name, color, mascot, bio)
  values(target_classroom, auth.uid(), trim(team_name), upper(trim(team_short_name)), team_color, trim(team_mascot), trim(team_bio)) returning id into new_team;
  insert into team_members(team_id, user_id, number, position, role) values(new_team, auth.uid(), 10, 'A definir', 'captain');
  return new_team;
end;
$$;

create or replace function public.invite_player_by_nickname(target_team_id uuid, target_nickname text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare recipient uuid; invitation uuid; target_classroom uuid;
begin
  if not is_team_captain(target_team_id) then raise exception 'Somente o capitão pode convidar jogadores.'; end if;
  if (select count(*) from team_members where team_id = target_team_id) >= 12 then raise exception 'O time já atingiu o limite de 12 jogadores.'; end if;
  select id into recipient from profiles where nickname = lower(trim(target_nickname));
  if recipient is null then raise exception 'Nickname não encontrado.'; end if;
  if recipient = auth.uid() then raise exception 'Você já é o capitão deste time.'; end if;
  select classroom_id into target_classroom from teams where id = target_team_id;
  if not exists(select 1 from classroom_members where classroom_id = target_classroom and user_id = recipient) then raise exception 'Esse jogador não pertence à mesma sala.'; end if;
  if exists(select 1 from team_members where user_id = recipient) then raise exception 'Esse jogador já pertence a um time.'; end if;
  insert into team_invitations(team_id, recipient_id, invited_by, status)
  values(target_team_id, recipient, auth.uid(), 'pending')
  on conflict(team_id, recipient_id) do update set status = 'pending', invited_by = auth.uid(), created_at = now(), responded_at = null
  returning id into invitation;
  return invitation;
end;
$$;

create or replace function public.respond_team_invitation(invitation_id uuid, accept_invitation boolean)
returns void language plpgsql security definer set search_path = public
as $$
declare invitation team_invitations%rowtype; next_number smallint;
begin
  select * into invitation from team_invitations where id = invitation_id and recipient_id = auth.uid() and status = 'pending' for update;
  if invitation.id is null then raise exception 'Convite não encontrado.'; end if;
  if not accept_invitation then update team_invitations set status = 'declined', responded_at = now() where id = invitation.id; return; end if;
  if exists(select 1 from team_members where user_id = auth.uid()) then raise exception 'Você já pertence a um time.'; end if;
  select coalesce(min(number), 1) into next_number from generate_series(1, 99) number where not exists(select 1 from team_members tm where tm.team_id = invitation.team_id and tm.number = number);
  insert into team_members(team_id, user_id, number, position, role) values(invitation.team_id, auth.uid(), next_number, 'A definir', 'player');
  update team_invitations set status = 'accepted', responded_at = now() where id = invitation.id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.classroom_members enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_invitations enable row level security;
alter table public.matches enable row level security;
alter table public.player_match_stats enable row level security;

create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "members read their classroom" on public.classrooms for select to authenticated using (is_classroom_member(id));
create policy "representatives update classroom" on public.classrooms for update to authenticated using (is_classroom_representative(id)) with check (is_classroom_representative(id));
create policy "members read classroom memberships" on public.classroom_members for select to authenticated using (is_classroom_member(classroom_id));
create policy "members read classroom teams" on public.teams for select to authenticated using (is_classroom_member(classroom_id));
create policy "captain updates own team" on public.teams for update to authenticated using (captain_id = auth.uid()) with check (captain_id = auth.uid());
create policy "members read team rosters" on public.team_members for select to authenticated using (exists(select 1 from teams where teams.id = team_id and is_classroom_member(teams.classroom_id)));
create policy "captain removes players" on public.team_members for delete to authenticated using (is_team_captain(team_id) and role <> 'captain');
create policy "recipient or captain reads invitations" on public.team_invitations for select to authenticated using (recipient_id = auth.uid() or is_team_captain(team_id));
create policy "members read matches" on public.matches for select to authenticated using (is_classroom_member(classroom_id));
create policy "representatives manage matches" on public.matches for all to authenticated using (is_classroom_representative(classroom_id)) with check (is_classroom_representative(classroom_id));
create policy "members read player stats" on public.player_match_stats for select to authenticated using (exists(select 1 from matches where matches.id = match_id and is_classroom_member(matches.classroom_id)));
create policy "representatives manage player stats" on public.player_match_stats for all to authenticated using (exists(select 1 from matches where matches.id = match_id and is_classroom_representative(matches.classroom_id))) with check (exists(select 1 from matches where matches.id = match_id and is_classroom_representative(matches.classroom_id)));

create or replace view public.match_overview with (security_invoker = true) as
select m.id, m.classroom_id, m.sport, m.starts_at, m.venue, m.status,
  ht.name home_team, ht.color home_color, m.home_score,
  at.name away_team, at.color away_color, m.away_score
from public.matches m join public.teams ht on ht.id = m.home_team_id join public.teams at on at.id = m.away_team_id;

create or replace view public.standings with (security_invoker = true) as
with results as (
  select m.classroom_id, m.home_team_id team_id, m.home_score goals_for, m.away_score goals_against from public.matches m where m.status = 'finished'
  union all
  select m.classroom_id, m.away_team_id, m.away_score, m.home_score from public.matches m where m.status = 'finished'
)
select t.classroom_id, t.id team_id, t.name team_name, t.short_name, t.color,
  count(r.team_id)::int played,
  count(*) filter(where r.goals_for > r.goals_against)::int wins,
  count(*) filter(where r.goals_for = r.goals_against)::int draws,
  count(*) filter(where r.goals_for < r.goals_against)::int losses,
  coalesce(sum(r.goals_for), 0)::int goals_for,
  coalesce(sum(r.goals_against), 0)::int goals_against,
  (count(*) filter(where r.goals_for > r.goals_against) * 3 + count(*) filter(where r.goals_for = r.goals_against))::int points
from public.teams t left join results r on r.team_id = t.id group by t.classroom_id, t.id;

create or replace view public.player_leaderboard with (security_invoker = true) as
select t.classroom_id, p.id player_id, p.nickname, t.name team_name, t.color team_color,
  coalesce(sum(s.goals), 0)::int goals, coalesce(sum(s.assists), 0)::int assists, count(distinct s.match_id)::int matches
from public.team_members tm join public.profiles p on p.id = tm.user_id join public.teams t on t.id = tm.team_id
left join public.player_match_stats s on s.player_id = p.id and s.team_id = t.id
group by t.classroom_id, p.id, t.id;

create or replace view public.team_invitation_overview with (security_invoker = true) as
select i.id, i.recipient_id, i.status, i.created_at, t.name team_name, p.nickname invited_by
from public.team_invitations i join public.teams t on t.id = i.team_id join public.profiles p on p.id = i.invited_by;

grant select on public.match_overview, public.standings, public.player_leaderboard, public.team_invitation_overview to authenticated;
grant execute on function public.create_classroom_with_owner(text, text), public.join_classroom_by_code(text), public.create_team_with_captain(text, text, text, text, text), public.invite_player_by_nickname(uuid, text), public.respond_team_invitation(uuid, boolean) to authenticated;
