-- Apply once in the Supabase SQL editor. No sample rows or public access.
begin;
create table public.analytics_sessions (
  session_id uuid primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  landing_path text not null,
  last_path text not null,
  page_views bigint not null default 0,
  active_seconds double precision not null default 0,
  referrer text, source text, medium text, campaign text, country text,
  device text not null check (device in ('desktop','mobile','tablet')),
  browser text not null, os text not null
);
create table public.analytics_events (
  id uuid primary key,
  session_id uuid not null references public.analytics_sessions(session_id) on delete cascade,
  event_type text not null check (event_type in ('session_start','page_view','route_change','tool_execution')),
  path text not null, tool_slug text, success boolean,
  created_at timestamptz not null default now()
);
create index analytics_sessions_last_seen_idx on public.analytics_sessions(last_seen);
create index analytics_sessions_first_seen_idx on public.analytics_sessions(first_seen);
create index analytics_events_created_at_idx on public.analytics_events(created_at);
create index analytics_events_session_idx on public.analytics_events(session_id, created_at);
create index analytics_events_type_idx on public.analytics_events(event_type, created_at);
create index analytics_events_tool_idx on public.analytics_events(tool_slug, created_at) where tool_slug is not null;
-- A single persistent login budget, containing no client identifiers or IPs.
create table public.analytics_admin_rate (
  id boolean primary key default true check (id),
  window_start timestamptz not null, attempts integer not null
);
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.analytics_admin_rate enable row level security;
revoke all on public.analytics_sessions, public.analytics_events, public.analytics_admin_rate from public, anon, authenticated;
grant select, insert, update, delete on public.analytics_sessions, public.analytics_events, public.analytics_admin_rate to service_role;

create function public.analytics_admin_attempt() returns boolean
language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
  insert into public.analytics_admin_rate(id, window_start, attempts) values(true, now(), 1)
  on conflict(id) do update set
    window_start = case when analytics_admin_rate.window_start < now() - interval '15 minutes' then now() else analytics_admin_rate.window_start end,
    attempts = case when analytics_admin_rate.window_start < now() - interval '15 minutes' then 1 else least(analytics_admin_rate.attempts + 1, 21) end
  returning attempts into n;
  return n <= 20;
end $$;

create function public.analytics_ingest(
  p_session uuid, p_event uuid, p_type text, p_path text,
  p_tool text, p_success boolean, p_referrer text, p_source text, p_medium text,
  p_campaign text, p_browser text, p_os text, p_device text, p_country text
) returns boolean language plpgsql security invoker set search_path = '' as $$
declare s public.analytics_sessions; t timestamptz := now();
begin
  if p_type not in ('page_view','route_change','tool_execution','heartbeat') then raise exception 'Invalid event'; end if;
  -- Serialize one session, including its very first concurrent events.
  perform pg_advisory_xact_lock(hashtextextended(p_session::text, 0));
  if exists(select 1 from public.analytics_events where id = p_event) then return true; end if;
  select * into s from public.analytics_sessions where session_id = p_session for update;
  if not found then
    if p_type = 'heartbeat' then return true; end if;
    insert into public.analytics_sessions(session_id, landing_path, last_path, referrer, source, medium, campaign, country, device, browser, os)
    values(p_session, p_path, p_path, p_referrer, p_source, p_medium, p_campaign, p_country, p_device, p_browser, p_os)
    returning * into s;
    insert into public.analytics_events(id, session_id, event_type, path) values(gen_random_uuid(), p_session, 'session_start', p_path);
  end if;
  if p_type = 'heartbeat' and s.last_seen > t - interval '20 seconds' then return true; end if;
  if p_type <> 'heartbeat' and (select count(*) from public.analytics_events where session_id = p_session and created_at > t - interval '1 minute') >= 60 then return false; end if;
  update public.analytics_sessions set last_seen = t, last_path = p_path,
    active_seconds = active_seconds + case when t - s.last_seen <= interval '90 seconds' then greatest(0, extract(epoch from t - s.last_seen)) else 0 end,
    page_views = page_views + case when p_type in ('page_view','route_change') then 1 else 0 end
    where session_id = p_session;
  if p_type <> 'heartbeat' then
    insert into public.analytics_events(id, session_id, event_type, path, tool_slug, success)
    values(p_event, p_session, p_type, p_path, p_tool, p_success);
  end if;
  return true;
end $$;

create function public.analytics_dashboard(p_days integer) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare t timestamptz := now(); start_at timestamptz; today_at timestamptz; step interval; result jsonb;
begin
  if p_days not in (1,7,30) then raise exception 'Invalid range'; end if;
  today_at := date_trunc('day', t at time zone 'Asia/Dubai') at time zone 'Asia/Dubai';
  start_at := today_at - make_interval(days => p_days - 1);
  step := case when p_days = 1 then interval '1 hour' else interval '1 day' end;
  with events as materialized (
    select * from public.analytics_events where created_at >= start_at and created_at <= t
  ), visitors as materialized (
    select s.* from public.analytics_sessions s where s.last_seen >= start_at and s.first_seen <= t
  ), today_events as materialized (
    select * from public.analytics_events where created_at >= today_at and created_at <= t
  ), pages as (
    select path, count(*) views, count(distinct session_id) visitors from events
    where event_type in ('page_view','route_change') group by path order by views desc limit 20
  ), tools as (
    select tool_slug as name, count(*) runs, count(*) filter(where success is true) succeeded,
      count(*) filter(where success is false) failed, count(*) filter(where success is null) unknown,
      round(100.0 * count(*) / nullif(sum(count(*)) over(), 0), 1) percentage
    from events where event_type = 'tool_execution' group by tool_slug order by runs desc
  ), acquisition as (
    select case when source is not null then 'UTM: ' || source
      when referrer is null then 'Direct'
      when referrer ~ '(^|\.)google\.[a-z.]+$' then 'Google'
      when referrer ~ '(^|\.)bing\.com$' then 'Bing'
      when referrer ~ '(^|\.)(facebook|instagram|linkedin|twitter|x|tiktok|pinterest|reddit)\.com$' or referrer = 't.co' then 'Social: ' || referrer
      else referrer end name, count(*) value from visitors group by 1 order by value desc
  ), geography as (select coalesce(country,'Unknown') name, count(*) value from visitors group by 1 order by value desc),
  devices as (select device name, count(*) value from visitors group by device order by value desc),
  buckets as (select generate_series(start_at, t, step) bucket),
  traffic as (
    select b.bucket, to_char(b.bucket at time zone 'Asia/Dubai', case when p_days = 1 then 'HH24:MI' else 'DD Mon' end) label,
      count(e.id) views, count(distinct e.session_id) visitors
    from buckets b left join events e on e.created_at >= b.bucket and e.created_at < b.bucket + step and e.event_type in ('page_view','route_change')
    group by b.bucket order by b.bucket
  ), live as (
    select session_id, first_seen, last_seen, last_path, country, device, browser, os, referrer, source, medium, campaign,
      round(active_seconds::numeric) duration from public.analytics_sessions
    where last_seen >= t - interval '90 seconds' order by last_seen desc limit 100
  ), activity as (select id, session_id, event_type, path, tool_slug, success, created_at from events order by created_at desc limit 50)
  select jsonb_build_object(
    'updatedAt', t, 'rangeStart', start_at,
    'metrics', jsonb_build_object(
      'online', (select count(*) from public.analytics_sessions where last_seen >= t - interval '90 seconds'),
      'visitors', (select count(*) from public.analytics_sessions where last_seen >= today_at and first_seen <= t),
      'sessions', (select count(*) from public.analytics_sessions where first_seen >= today_at and first_seen <= t),
      'views', (select count(*) from today_events where event_type in ('page_view','route_change')),
      'tools', (select count(*) from today_events where event_type = 'tool_execution'),
      'duration', (select coalesce(round(avg(s.active_seconds)::numeric), 0) from public.analytics_sessions s where s.last_seen >= today_at and s.first_seen <= t)
    ),
    'traffic', coalesce((select jsonb_agg(traffic) from traffic), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(pages) from pages), '[]'::jsonb),
    'tools', coalesce((select jsonb_agg(tools) from tools), '[]'::jsonb),
    'acquisition', coalesce((select jsonb_agg(acquisition) from acquisition), '[]'::jsonb),
    'geography', coalesce((select jsonb_agg(geography) from geography), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(devices) from devices), '[]'::jsonb),
    'live', coalesce((select jsonb_agg(live) from live), '[]'::jsonb),
    'activity', coalesce((select jsonb_agg(activity) from activity), '[]'::jsonb)
  ) into result;
  return result;
end $$;
revoke all on function public.analytics_ingest(uuid,uuid,text,text,text,boolean,text,text,text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.analytics_dashboard(integer) from public, anon, authenticated;
revoke all on function public.analytics_admin_attempt() from public, anon, authenticated;
grant execute on function public.analytics_ingest(uuid,uuid,text,text,text,boolean,text,text,text,text,text,text,text,text) to service_role;
grant execute on function public.analytics_dashboard(integer) to service_role;
grant execute on function public.analytics_admin_attempt() to service_role;
commit;
