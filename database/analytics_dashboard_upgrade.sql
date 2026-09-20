-- Upgrade existing analytics schema with filtered dashboard metrics and paginated history.
begin;

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
        round(s.active_seconds::numeric)::integer duration,
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

revoke all on function public.analytics_dashboard_filtered(text,date,date,time,time,text,text,text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.analytics_dashboard_filtered(text,date,date,time,time,text,text,text,text,integer,integer) to service_role;

commit;
