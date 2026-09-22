'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, RefreshCw, ShieldCheck, LogOut, MousePointerClick, X } from 'lucide-react';
import type { AnalyticsDashboardData, Breakdown } from '@/lib/analytics-types';
import { toolLabel, toolSlugToPath } from '@/lib/tool-labels';

const panel = 'rounded-2xl border border-slate-800 bg-slate-900/80 p-5';
const button = 'rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-50';
const accent = 'text-red-400';
const empty = <p className="py-8 text-sm text-slate-400">No traffic recorded yet.</p>;
const duration = (seconds: number) => `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
const time = (date: string) => new Date(date).toLocaleString('en-GB', { timeZone: 'Asia/Dubai', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const ranges = [['today','Today'],['yesterday','Yesterday'],['7d','7 Days'],['30d','30 Days'],['this_month','This Month'],['last_month','Last Month'],['all','All Time'],['custom','Custom']] as const;
type RangeValue = typeof ranges[number][0];

function Section({ id, title, subtitle, children, flashed }: { id: string; title: string; subtitle?: string; children: ReactNode; flashed: boolean }) {
  return <section id={`admin-section-${id}`} className={`${panel} scroll-mt-6 transition-shadow ${flashed ? 'shadow-[0_0_0_2px_rgba(248,113,113,0.7)]' : ''}`}>
    <h2 className="mb-1 text-base font-semibold text-white">{title}</h2>
    {subtitle && <p className="mb-5 text-xs text-slate-400">{subtitle}</p>}
    {!subtitle && <div className="mb-5" />}
    {children}
  </section>;
}

function Distribution({ rows }: { rows: Breakdown[] }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return rows.length ? <div className="space-y-4">{rows.map(row => <div key={row.name}>
    <div className="mb-2 flex justify-between gap-3 text-sm"><span className="break-all capitalize text-slate-300">{row.name}</span><span>{row.value.toLocaleString()}</span></div>
    <div className="h-1.5 rounded bg-slate-800"><div className="h-full rounded bg-red-400" style={{ width: `${total ? row.value / total * 100 : 0}%` }} /></div>
  </div>)}</div> : empty;
}

export function AdminLogin() {
  const router = useRouter(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const passcode = new FormData(event.currentTarget).get('passcode');
    try {
      const response = await fetch('/api/admin/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Sign in failed.');
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  }
  return <div className="rounded-3xl bg-slate-950 px-6 py-20 text-slate-100"><form onSubmit={login} className={`${panel} mx-auto max-w-md space-y-5`}>
    <ShieldCheck className={accent} /><h1 className="text-2xl font-semibold">Analytics admin</h1><p className="text-sm text-slate-400">Sign in to view private visitor analytics.</p>
    <label className="block text-sm">Admin passcode<input name="passcode" type="password" required maxLength={256} autoComplete="current-password" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" /></label>
    {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    <button className={`${button} w-full bg-red-500/10`} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
  </form></div>;
}

export function AdminDashboard() {
  const router = useRouter();
  const [range, setRange] = useState<RangeValue>('today');
  const [startDate, setStartDate] = useState(''); const [endDate, setEndDate] = useState('');
  const [fromTime, setFromTime] = useState(''); const [toTime, setToTime] = useState('');
  const [country, setCountry] = useState(''); const [device, setDevice] = useState('');
  const [source, setSource] = useState(''); const [pageFilter, setPageFilter] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [age, setAge] = useState(0);
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  const pendingScroll = useRef<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doScroll = useCallback((key: string) => {
    const el = document.getElementById(`admin-section-${key}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlashKey(key);
    flashTimer.current = setTimeout(() => setFlashKey(null), 1800);
  }, []);

  const scrollToSection = useCallback((key: string) => {
    pendingScroll.current = key;
    doScroll(key);
  }, [doScroll]);

  useEffect(() => {
    if (data && pendingScroll.current) { doScroll(pendingScroll.current); pendingScroll.current = null; }
  }, [data, doScroll]);

  const refresh = useCallback(async () => {
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller; setBusy(true);
    try {
      const query = new URLSearchParams({ range, historyPage: String(historyPage), historySize: '25' });
      if (startDate) query.set('startDate', startDate); if (endDate) query.set('endDate', endDate);
      if (fromTime) query.set('fromTime', fromTime); if (toTime) query.set('toTime', toTime);
      if (country) query.set('country', country); if (device) query.set('device', device);
      if (source) query.set('source', source); if (pageFilter) query.set('page', pageFilter);
      const response = await fetch(`/api/admin/analytics?${query}`, { cache: 'no-store', signal: controller.signal });
      if (response.status === 401) { router.refresh(); return; }
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Analytics unavailable.');
      setData(result); setError(''); setAge(0);
    } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Analytics unavailable.'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }, [range, startDate, endDate, fromTime, toTime, country, device, source, pageFilter, historyPage, router]);

  useEffect(() => {
    const initial = setTimeout(() => { void refresh(); }, 0);
    const poll = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 15_000);
    const visible = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', visible);
    return () => { clearTimeout(initial); clearInterval(poll); pending.current?.abort(); document.removeEventListener('visibilitychange', visible); };
  }, [refresh]);

  useEffect(() => {
    if (!data) return;
    const timer = setInterval(() => setAge(Math.max(0, Math.floor((Date.now() - Date.parse(data.updatedAt)) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [data]);

  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  async function logout() {
    try { const response = await fetch('/api/admin/verify', { method: 'DELETE' }); if (!response.ok) throw new Error(); router.refresh(); }
    catch { setError('Unable to sign out. Please retry.'); }
  }

  const setDashboardRange = (value: RangeValue) => { setData(null); setError(''); setHistoryPage(1); setRange(value); };
  const drillRange = (value: RangeValue) => { setDashboardRange(value); scrollToSection('history'); };
  const clearTableFilters = () => { setCountry(''); setDevice(''); setSource(''); setPageFilter(''); setHistoryPage(1); };
  const drillTool = (slug: string) => { setPageFilter(toolSlugToPath(slug)); setHistoryPage(1); scrollToSection('history'); };
  const hasTableFilters = country !== '' || device !== '' || source !== '' || pageFilter !== '';

  const cards: { label: string; value: string; hint: string; action: string }[] = data ? [
    { label: 'Online Now', value: data.metrics.online.toLocaleString(), hint: 'See who is online', action: 'live' },
    { label: 'All-time Visitors', value: data.metrics.allTimeVisitors.toLocaleString(), hint: 'List all visitors', action: 'range:all' },
    { label: 'Today Visitors', value: data.metrics.todayVisitors.toLocaleString(), hint: "List today's visitors", action: 'range:today' },
    { label: 'Yesterday Visitors', value: data.metrics.yesterdayVisitors.toLocaleString(), hint: "List yesterday's visitors", action: 'range:yesterday' },
    { label: 'This Month Visitors', value: data.metrics.thisMonthVisitors.toLocaleString(), hint: 'List this month', action: 'range:this_month' },
    { label: 'Previous Month Visitors', value: data.metrics.previousMonthVisitors.toLocaleString(), hint: 'List last month', action: 'range:last_month' },
    { label: 'New Visitors', value: data.metrics.newVisitors.toLocaleString(), hint: 'List in history', action: 'history' },
    { label: 'Returning Visitors', value: data.metrics.returningVisitors.toLocaleString(), hint: 'List in history', action: 'history' },
    { label: 'Total Sessions', value: data.metrics.sessions.toLocaleString(), hint: 'List sessions', action: 'history' },
    { label: 'Total Page Views', value: data.metrics.views.toLocaleString(), hint: 'See top pages', action: 'pages' },
    { label: 'Total Tool Runs', value: data.metrics.tools.toLocaleString(), hint: 'See product ranking', action: 'products' },
    { label: 'Avg Session Duration', value: duration(data.metrics.duration), hint: 'List sessions', action: 'history' },
  ] : [];

  function handleCardClick(action: string) {
    if (action.startsWith('range:')) drillRange(action.slice(6) as RangeValue);
    else scrollToSection(action);
  }

  const maxRuns = data?.tools.reduce((m, t) => Math.max(m, t.runs), 0) ?? 0;

  return <div className="min-h-screen rounded-3xl bg-slate-950 p-4 text-slate-100 sm:p-7">
    <header className="mb-8 flex flex-wrap items-start justify-between gap-5"><div><div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-red-400"><Activity size={16} /> PDFEdit analytics</div><h1 className="text-3xl font-semibold tracking-tight">Traffic overview</h1><p className="mt-2 text-sm text-slate-400">Anonymous sessions · Asia/Dubai · live data, no samples</p></div>
      <div className="flex flex-wrap items-center gap-2"><button className={button} onClick={() => void refresh()} disabled={busy}><RefreshCw size={15} className={`mr-2 inline ${busy ? 'animate-spin' : ''}`} />Refresh</button><button className={button} onClick={() => void logout()}><LogOut size={15} className="mr-2 inline" />Sign out</button></div>
    </header>
    <div className="mb-5 space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><div role="group" aria-label="Analytics time range" className="flex flex-wrap gap-1 rounded-xl border border-slate-800 p-1">{ranges.map(([value,label]) => <button key={value} aria-pressed={range === value} onClick={() => setDashboardRange(value)} className={`rounded-lg px-3 py-2 text-sm ${range === value ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}>{label}</button>)}</div><p className="text-xs text-slate-400" aria-live="polite">{data ? `Last updated ${age} seconds ago${error ? ' · stale' : ''}` : 'Waiting for database'}</p></div>
      {range === 'custom' && <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-800 p-3"><label className="text-xs text-slate-400">From date<input type="date" value={startDate} onChange={event => { setStartDate(event.target.value); setHistoryPage(1); }} className="mt-1 block rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" /></label><label className="text-xs text-slate-400">To date<input type="date" value={endDate} onChange={event => { setEndDate(event.target.value); setHistoryPage(1); }} className="mt-1 block rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" /></label><button className={button} onClick={() => void refresh()} disabled={!startDate || !endDate}>Apply dates</button></div>}
      {(range === 'today' || range === 'yesterday') && <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-800 p-3"><label className="text-xs text-slate-400">From time<input type="time" value={fromTime} onChange={event => { setFromTime(event.target.value); setHistoryPage(1); }} className="mt-1 block rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" /></label><label className="text-xs text-slate-400">To time<input type="time" value={toTime} onChange={event => { setToTime(event.target.value); setHistoryPage(1); }} className="mt-1 block rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" /></label><span className="pb-2 text-xs text-slate-500">Dubai time</span></div>}
    </div>
    {error && <div role="alert" className="mb-6 rounded-xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</div>}
    {!data && !error && <div className={`${panel} animate-pulse py-16 text-center text-slate-400`}>Loading analytics…</div>}
    {data && <div className="space-y-6">
      <div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">{cards.map(card => <button key={card.label} onClick={() => handleCardClick(card.action)} title={card.hint} className={`${panel} group cursor-pointer text-left transition hover:border-red-500/60 hover:bg-slate-900`}><p className="mb-3 flex items-center justify-between text-xs text-slate-400">{card.label}<MousePointerClick size={13} className="opacity-0 transition group-hover:opacity-60" /></p><p className="text-2xl font-semibold tracking-tight">{card.value}</p><p className="mt-2 text-[11px] text-slate-500 opacity-0 transition group-hover:opacity-100">{card.hint} →</p></button>)}</div>
        <p className="mt-3 text-xs text-slate-500">Every card is clickable — click a number to drill into the matching list. Range totals and charts follow the selected Dubai-time window. Visitors are distinct anonymous session IDs, not identified people. Duration measures observed active time for the selected visitors.</p>
      </div>

      <Section id="live" title={`Live Visitors · ${data.metrics.online}`} subtitle="Seen in the past 90 seconds. Showing up to 100 sessions — this is who is on your site right now and what product page they are on." flashed={flashKey === 'live'}>
        {data.live.length ? <div className="overflow-x-auto"><table className="w-full whitespace-nowrap text-left text-xs"><thead className="text-slate-500"><tr>{['Session','Currently on','Country','Device / browser','Source','Active time','Last activity'].map(label => <th key={label} className="px-3 pb-3 font-medium">{label}</th>)}</tr></thead><tbody>{data.live.map(row => <tr key={row.session_id} className="border-t border-slate-800"><td className="px-3 py-4"><span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />{row.session_id.slice(0,8)}</td><td className="px-3 font-medium text-white" title={row.last_path}>{toolLabel(row.last_path)}</td><td className="px-3">{row.country || 'Unknown'}</td><td className="px-3">{row.device} / {row.browser}</td><td className="px-3">{row.source || row.referrer || 'Direct'}</td><td className="px-3">{duration(row.duration)}</td><td className="px-3">{time(row.last_seen)}</td></tr>)}</tbody></table></div> : empty}
      </Section>

      <Section id="products" title="Product Usage" subtitle="Every product ranked by how many times it was actually used in the selected window. Click a product to list the visitors who used it." flashed={flashKey === 'products'}>
        {data.tools.length ? <div className="space-y-2">{data.tools.map((row, i) => {
          const total = row.succeeded + row.failed + row.unknown;
          const successRate = total ? Math.round(row.succeeded / total * 100) : 0;
          return <button key={row.name} onClick={() => drillTool(row.name)} title={`List visitors who used ${toolLabel(toolSlugToPath(row.name))}`} className="group block w-full rounded-xl border border-transparent p-3 text-left transition hover:border-red-500/50 hover:bg-slate-800/60">
            <div className="flex items-center gap-3">
              <span className="w-7 shrink-0 text-center text-sm font-bold text-slate-500">{i + 1}</span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><span className="truncate text-sm font-medium text-white">{toolLabel(toolSlugToPath(row.name))}</span><span className="shrink-0 text-sm text-slate-300">{row.runs.toLocaleString()} runs · {row.percentage}% of all runs</span></div>
                <div className="mt-2 h-2 rounded bg-slate-800"><div className="h-full rounded bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${maxRuns ? row.runs / maxRuns * 100 : 0}%` }} /></div>
                <p className="mt-1.5 text-xs text-slate-500">Success {row.succeeded.toLocaleString()} · Failed {row.failed.toLocaleString()} · Unreported {row.unknown.toLocaleString()} · <span className={successRate >= 90 ? 'text-emerald-400' : successRate >= 70 ? 'text-amber-400' : 'text-rose-400'}>{successRate}% success</span> <span className="opacity-0 transition group-hover:opacity-100">· click to list visitors →</span></p>
              </div>
            </div>
          </button>;
        })}</div> : empty}
      </Section>

      <Section id="history" title="Visitor History" subtitle={hasTableFilters ? 'Filtered — the whole dashboard follows these filters.' : 'Every session in the selected window. Click any stat card above to jump here.'} flashed={flashKey === 'history'}>
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-400">Country<select value={country} onChange={event => { setCountry(event.target.value); setHistoryPage(1); }} className="mt-1 block rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white"><option value="">All countries</option>{data.geography.map(row => <option key={row.name} value={row.name}>{row.name}</option>)}</select></label>
          <label className="text-xs text-slate-400">Device<select value={device} onChange={event => { setDevice(event.target.value); setHistoryPage(1); }} className="mt-1 block rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white"><option value="">All devices</option>{data.devices.map(row => <option key={row.name} value={row.name}>{row.name}</option>)}</select></label>
          <label className="text-xs text-slate-400">Source<select value={source} onChange={event => { setSource(event.target.value); setHistoryPage(1); }} className="mt-1 block rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white"><option value="">All sources</option>{data.acquisition.map(row => <option key={row.name} value={row.name}>{row.name}</option>)}</select></label>
          <label className="text-xs text-slate-400">Page<input value={pageFilter} onChange={event => { setPageFilter(event.target.value); setHistoryPage(1); }} placeholder="/merge-pdf" className="mt-1 block w-36 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" /></label>
          {hasTableFilters && <button className={`${button} inline-flex items-center gap-1 border-red-500/50 text-red-300`} onClick={clearTableFilters}><X size={13} /> Clear filters</button>}
        </div>
        {data.history.length ? <div className="overflow-x-auto"><table className="w-full min-w-[980px] whitespace-nowrap text-left text-xs"><thead className="text-slate-500"><tr>{['Time','Anonymous session','Landing page','Last page','Country','Device/browser','Source/referrer','Active time','Page views','Tool runs'].map(label => <th key={label} className="px-3 pb-3 font-medium">{label}</th>)}</tr></thead><tbody>{data.history.map(row => <tr key={row.session_id} className="border-t border-slate-800"><td className="px-3 py-4">{time(row.first_seen)}</td><td className="px-3 font-mono">{row.session_id.slice(0,8)}</td><td className="px-3" title={row.landing_path}>{toolLabel(row.landing_path)}</td><td className="px-3 font-medium text-slate-200" title={row.last_path}>{toolLabel(row.last_path)}</td><td className="px-3">{row.country || 'Unknown'}</td><td className="px-3">{row.device} / {row.browser}</td><td className="px-3">{row.source}</td><td className="px-3">{duration(row.duration)}</td><td className="px-3">{row.page_views}</td><td className="px-3">{row.tool_uses}</td></tr>)}</tbody></table></div> : empty}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400"><span>{data.historyMeta.total.toLocaleString()} sessions · Page {data.historyMeta.page} of {data.historyMeta.totalPages}</span><div className="flex gap-2"><button className={button} disabled={data.historyMeta.page <= 1} onClick={() => setHistoryPage(value => value - 1)}>Previous</button><button className={button} disabled={data.historyMeta.page >= data.historyMeta.totalPages} onClick={() => setHistoryPage(value => value + 1)}>Next</button></div></div>
      </Section>

      <Section id="pages" title="Top Pages" subtitle="Most visited pages in the selected window, by product name." flashed={flashKey === 'pages'}>
        {data.pages.length ? <div className="space-y-4"><div className="flex justify-between text-xs text-slate-500"><span>Page</span><span>Views / visitors</span></div>{data.pages.map(row => <div key={row.path} className="flex justify-between gap-4 border-t border-slate-800 pt-3 text-sm"><span className="break-all text-slate-300" title={row.path}>{toolLabel(row.path)}</span><span className="shrink-0">{row.views} / {row.visitors}</span></div>)}</div> : empty}
      </Section>

      <Section id="traffic" title="Traffic" subtitle={`Page views and visitors · Dubai ${range === 'today' ? 'hours' : 'calendar days'}`} flashed={flashKey === 'traffic'}>
        {data.traffic.some(row => row.views > 0) ? <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.traffic} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}><CartesianGrid stroke="#1e293b" vertical={false} /><XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} /><YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} /><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} /><Area isAnimationActive={false} name="Page views" dataKey="views" stroke="#f87171" fill="#f87171" fillOpacity={0.12} /><Area isAnimationActive={false} name="Visitors" dataKey="visitors" stroke="#fb923c" fill="#fb923c" fillOpacity={0.06} /></AreaChart></ResponsiveContainer></div> : empty}
      </Section>

      <div className="grid gap-6 md:grid-cols-3"><Section id="acq" title="Acquisition" flashed={flashKey === 'acq'}><Distribution rows={data.acquisition} /></Section><Section id="geo" title="Geography" flashed={flashKey === 'geo'}><Distribution rows={data.geography} /></Section><Section id="dev" title="Devices" flashed={flashKey === 'dev'}><Distribution rows={data.devices} /></Section></div>

      <Section id="activity" title="Recent Activity" subtitle="Latest raw events in the selected window." flashed={flashKey === 'activity'}>
        {data.activity.length ? <div className="max-h-96 space-y-3 overflow-y-auto">{data.activity.map(row => <div key={row.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-3 text-xs"><div><span className="mr-3 text-red-300">{row.event_type.replaceAll('_',' ')}</span><span className="text-slate-300" title={row.tool_slug || row.path}>{row.tool_slug ? toolLabel(toolSlugToPath(row.tool_slug)) : toolLabel(row.path)}</span>{row.event_type === 'tool_execution' && <span className="ml-2 text-slate-500">{row.success === null ? 'Outcome unreported' : row.success ? 'Success' : 'Failed'}</span>}<span className="ml-3 text-slate-500">{row.session_id.slice(0,8)}</span></div><time className="text-slate-500">{time(row.created_at)}</time></div>)}</div> : empty}
      </Section>
    </div>}
  </div>;
}
