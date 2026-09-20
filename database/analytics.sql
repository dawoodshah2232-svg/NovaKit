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

create or replace function public.analytics_dashboard_filtered(
  p_range text,
  p_start_date date default null,
  p_end_date date default null,
  p_from_time time default null,
  p_to_time time default null,
  p_country text default null,
  p_device text default null,
  p_source text default null,
  p_page text default null,
  p_history_page integer default 1,
  p_history_size integer default 25
) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare
  now_at timestamptz := now();
  today_date date := (now_at at time zone 'Asia/Dubai')::date;
  start_date date; end_date date; start_at timestamptz; end_at timestamptz;
  bucket_interval interval; bucket_format text; history_offset integer;
begin
  if p_range not in ('today','yesterday','7d','30d','this_month','last_month','all','custom') then
    raise exception 'Invalid range';
  end if;
  if p_range = 'today' then start_date := today_date; end_date := today_date;
  elsif p_range = 'yesterday' then start_date := today_date - 1; end_date := today_date - 1;
  elsif p_range = '7d' then start_date := today_date - 6; end_date := today_date;
  elsif p_range = '30d' then start_date := today_date - 29; end_date := today_date;
  elsif p_range = 'this_month' then start_date := date_trunc('month', today_date)::date; end_date := today_date;
  elsif p_range = 'last_month' then start_date := (date_trunc('month', today_date) - interval '1 month')::date; end_date := (date_trunc('month', today_date) - interval '1 day')::date;
  elsif p_range = 'custom' then start_date := p_start_date; end_date := p_end_date;
  else
    select coalesce(min((first_seen at time zone 'Asia/Dubai')::date), today_date) into start_date from public.analytics_sessions;
    end_date := today_date;
  end if;
  if start_date is null or end_date is null or end_date < start_date then raise exception 'Invalid date range'; end if;
  start_at := (start_date::timestamp at time zone 'Asia/Dubai');
  end_at := ((end_date + 1)::timestamp at time zone 'Asia/Dubai');
  if start_date = end_date and p_from_time is not null then start_at := ((start_date + p_from_time) at time zone 'Asia/Dubai'); end if;
  if start_date = end_date and p_to_time is not null then end_at := ((end_date + p_to_time) at time zone 'Asia/Dubai'); end if;
  if end_at <= start_at then raise exception 'Invalid time range'; end if;
  if start_date = end_date then bucket_interval := interval '1 hour'; bucket_format := 'HH24:MI';
  elsif p_range = 'all' then bucket_interval := interval '1 month'; bucket_format := 'Mon YYYY';
  else bucket_interval := interval '1 day'; bucket_format := 'DD Mon'; end if;
  history_offset := greatest(coalesce(p_history_page, 1) - 1, 0) * least(greatest(coalesce(p_history_size, 25), 1), 100);

  return (
    with filtered_sessions as materialized (
      select s.* from public.analytics_sessions s
      where s.last_seen >= start_at and s.first_seen < end_at
        and (p_country is null or coalesce(s.country, 'Unknown') = p_country)
        and (p_device is null or s.device = p_device)
        and (p_source is null or coalesce(s.source, s.referrer, 'Direct') = p_source)
        and (p_page is null or s.last_path = p_page or s.landing_path = p_page)
    ), filtered_events as materialized (
      select e.* from public.analytics_events e join filtered_sessions s on s.session_id = e.session_id
      where e.created_at >= start_at and e.created_at < end_at
    ), history_rows as (
      select s.session_id, s.first_seen, s.landing_path, s.last_path, s.country, s.device, s.browser,
        coalesce(s.source, s.referrer, 'Direct') source,
        round(s.active_seconds)::integer duration,
        count(e.id) filter (where e.event_type in ('page_view','route_change'))::integer page_views,
        count(e.id) filter (where e.event_type = 'tool_execution')::integer tool_uses
      from filtered_sessions s left join filtered_events e on e.session_id = s.session_id
      group by s.session_id, s.first_seen, s.landing_path, s.last_path, s.country, s.device, s.browser, s.source, s.referrer, s.active_seconds
    ), history_total as (select count(*)::integer total from history_rows),
    buckets as (select generate_series(date_trunc('hour', start_at), date_trunc('hour', end_at - interval '1 second'), bucket_interval) bucket),
    traffic as (
      select b.bucket, to_char(b.bucket at time zone 'Asia/Dubai', bucket_format) label,
        count(e.id) filter (where e.event_type in ('page_view','route_change'))::integer views,
        count(distinct e.session_id) filter (where e.event_type in ('page_view','route_change'))::integer visitors
      from buckets b left join filtered_events e on e.created_at >= b.bucket and e.created_at < b.bucket + bucket_interval
      group by b.bucket order by b.bucket
    ),
    history_page as (
      select * from history_rows order by first_seen desc offset history_offset limit least(greatest(coalesce(p_history_size, 25), 1), 100)
    ),
    live as (
      select session_id, first_seen, last_seen, last_path, country, device, browser, os, referrer, source,
        round(active_seconds::numeric)::integer duration
      from public.analytics_sessions where last_seen >= now_at - interval '90 seconds' order by last_seen desc limit 100
    ),
    activity as (
      select id, session_id, event_type, path, tool_slug, success, created_at
      from filtered_events order by created_at desc limit 50
    ),
    all_time as (select count(*)::integer visitors from public.analytics_sessions),
    today as (select count(*)::integer visitors from public.analytics_sessions where first_seen < (today_date + 1)::timestamp at time zone 'Asia/Dubai' and last_seen >= today_date::timestamp at time zone 'Asia/Dubai'),
    yesterday as (select count(*)::integer visitors from public.analytics_sessions where first_seen < today_date::timestamp at time zone 'Asia/Dubai' and last_seen >= (today_date - 1)::timestamp at time zone 'Asia/Dubai'),
    this_month as (select count(*)::integer visitors from public.analytics_sessions where first_seen < (today_date + 1)::timestamp at time zone 'Asia/Dubai' and last_seen >= date_trunc('month', today_date)::timestamp at time zone 'Asia/Dubai'),
    previous_month as (select count(*)::integer visitors from public.analytics_sessions where first_seen < date_trunc('month', today_date)::timestamp at time zone 'Asia/Dubai' and last_seen >= (date_trunc('month', today_date) - interval '1 month')::timestamp at time zone 'Asia/Dubai')
    select jsonb_build_object(
      'updatedAt', now_at, 'rangeStart', start_at,
      'metrics', jsonb_build_object(
        'online', (select count(*)::integer from public.analytics_sessions where last_seen >= now_at - interval '90 seconds'),
        'visitors', (select count(*)::integer from filtered_sessions),
        'sessions', (select count(*)::integer from filtered_sessions),
        'views', (select count(*)::integer from filtered_events where event_type in ('page_view','route_change')),
        'tools', (select count(*)::integer from filtered_events where event_type = 'tool_execution'),
        'duration', (select coalesce(round(avg(active_seconds)::numeric), 0)::integer from filtered_sessions),
        'allTimeVisitors', (select visitors from all_time), 'todayVisitors', (select visitors from today),
        'yesterdayVisitors', (select visitors from yesterday), 'thisMonthVisitors', (select visitors from this_month),
        'previousMonthVisitors', (select visitors from previous_month),
        'newVisitors', (select count(*)::integer from filtered_sessions where first_seen >= start_at),
        'returningVisitors', (select count(*)::integer from filtered_sessions where first_seen < start_at)
      ),
      'traffic', coalesce((select jsonb_agg(traffic) from traffic), '[]'::jsonb),
      'pages', coalesce((select jsonb_agg(x) from (select path, count(*)::integer views, count(distinct session_id)::integer visitors from filtered_events where event_type in ('page_view','route_change') group by path order by views desc limit 20) x), '[]'::jsonb),
      'tools', coalesce((select jsonb_agg(x) from (select tool_slug name, count(*)::integer runs, round(100.0 * count(*) / nullif(sum(count(*)) over(), 0), 1) percentage, count(*) filter (where success is true)::integer succeeded, count(*) filter (where success is false)::integer failed, count(*) filter (where success is null)::integer unknown from filtered_events where event_type = 'tool_execution' group by tool_slug order by runs desc) x), '[]'::jsonb),
      'acquisition', coalesce((select jsonb_agg(x) from (select coalesce(source, referrer, 'Direct') name, count(*)::integer value from filtered_sessions group by 1 order by value desc) x), '[]'::jsonb),
      'geography', coalesce((select jsonb_agg(x) from (select coalesce(country, 'Unknown') name, count(*)::integer value from filtered_sessions group by 1 order by value desc) x), '[]'::jsonb),
      'devices', coalesce((select jsonb_agg(x) from (select device name, count(*)::integer value from filtered_sessions group by device order by value desc) x), '[]'::jsonb),
      'live', coalesce((select jsonb_agg(live) from live), '[]'::jsonb),
      'activity', coalesce((select jsonb_agg(activity) from activity), '[]'::jsonb),
      'history', coalesce((select jsonb_agg(history_page) from history_page), '[]'::jsonb),
      'historyMeta', jsonb_build_object('page', greatest(coalesce(p_history_page, 1), 1), 'pageSize', least(greatest(coalesce(p_history_size, 25), 1), 100), 'total', (select total from history_total), 'totalPages', greatest(ceil((select total from history_total)::numeric / least(greatest(coalesce(p_history_size, 25), 1), 100)), 1))
    )
  );
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
revoke all on function public.analytics_dashboard_filtered(text,date,date,time,time,text,text,text,text,integer,integer) from public, anon, authenticated;
revoke all on function public.analytics_admin_attempt() from public, anon, authenticated;
grant execute on function public.analytics_ingest(uuid,uuid,text,text,text,boolean,text,text,text,text,text,text,text,text) to service_role;
grant execute on function public.analytics_dashboard(integer) to service_role;
grant execute on function public.analytics_dashboard_filtered(text,date,date,time,time,text,text,text,text,integer,integer) to service_role;
grant execute on function public.analytics_admin_attempt() to service_role;
commit;
