'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, RefreshCw, ShieldCheck, LogOut } from 'lucide-react';
import type { AnalyticsDashboardData, Breakdown } from '@/lib/analytics-types';
const panel = 'rounded-2xl border border-slate-800 bg-slate-900/80 p-5';
const button = 'rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-50';
const empty = <p className="py-8 text-sm text-slate-400">No traffic recorded yet.</p>;
const duration = (seconds: number) => `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
const time = (date: string) => new Date(date).toLocaleString('en-GB', { timeZone: 'Asia/Dubai', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className={panel}><h2 className="mb-5 text-base font-semibold text-white">{title}</h2>{children}</section>;
}
function Distribution({ rows }: { rows: Breakdown[] }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return rows.length ? <div className="space-y-4">{rows.map(row => <div key={row.name}>
    <div className="mb-2 flex justify-between gap-3 text-sm"><span className="break-all capitalize text-slate-300">{row.name}</span><span>{row.value.toLocaleString()}</span></div>
    <div className="h-1.5 rounded bg-slate-800"><div className="h-full rounded bg-cyan-400" style={{ width: `${total ? row.value / total * 100 : 0}%` }} /></div>
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
    <ShieldCheck className="text-cyan-400" /><h1 className="text-2xl font-semibold">Analytics admin</h1><p className="text-sm text-slate-400">Sign in to view private visitor analytics.</p>
    <label className="block text-sm">Admin passcode<input name="passcode" type="password" required maxLength={256} autoComplete="current-password" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" /></label>
    {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    <button className={`${button} w-full bg-cyan-500/10`} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
  </form></div>;
}
export function AdminDashboard() {
  const router = useRouter();
  const [range, setRange] = useState('today');
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [age, setAge] = useState(0);
  const pending = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller; setBusy(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${range}`, { cache: 'no-store', signal: controller.signal });
      if (response.status === 401) { router.refresh(); return; }
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Analytics unavailable.');
      setData(result); setError(''); setAge(0);
    } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Analytics unavailable.'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }, [range, router]);
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
  async function logout() {
    try { const response = await fetch('/api/admin/verify', { method: 'DELETE' }); if (!response.ok) throw new Error(); router.refresh(); }
    catch { setError('Unable to sign out. Please retry.'); }
  }
  const cards = data ? [ ['Online Now', data.metrics.online], ['Visitors Today', data.metrics.visitors], ['Sessions Today', data.metrics.sessions], ['Page Views Today', data.metrics.views], ['Tools Used Today', data.metrics.tools], ['Avg Session Duration', duration(data.metrics.duration)] ] : [];
  return <div className="min-h-screen rounded-3xl bg-slate-950 p-4 text-slate-100 sm:p-7">
    <header className="mb-8 flex flex-wrap items-start justify-between gap-5"><div><div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400"><Activity size={16} /> PDFEdit analytics</div><h1 className="text-3xl font-semibold tracking-tight">Traffic overview</h1><p className="mt-2 text-sm text-slate-400">Anonymous sessions · Asia/Dubai</p></div>
      <div className="flex flex-wrap items-center gap-2"><button className={button} onClick={() => void refresh()} disabled={busy}><RefreshCw size={15} className={`mr-2 inline ${busy ? 'animate-spin' : ''}`} />Refresh</button><button className={button} onClick={() => void logout()}><LogOut size={15} className="mr-2 inline" />Sign out</button></div>
    </header>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div role="group" aria-label="Analytics time range" className="flex gap-1 rounded-xl border border-slate-800 p-1">{[['today','Today'],['7d','7 Days'],['30d','30 Days']].map(([value,label]) => <button key={value} aria-pressed={range === value} onClick={() => { if (range !== value) { setData(null); setError(''); setRange(value); } }} className={`rounded-lg px-4 py-2 text-sm ${range === value ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>{label}</button>)}</div><p className="text-xs text-slate-400" aria-live="polite">{data ? `Last updated ${age} seconds ago${error ? ' · stale' : ''}` : 'Waiting for database'}</p></div>
    {error && <div role="alert" className="mb-6 rounded-xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</div>}
    {!data && !error && <div className={`${panel} animate-pulse py-16 text-center text-slate-400`}>Loading analytics…</div>}
    {data && <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">{cards.map(([label,value]) => <div key={label} className={panel}><p className="mb-3 text-xs text-slate-400">{label}</p><p className="text-2xl font-semibold tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p></div>)}</div>
      <p className="text-xs text-slate-500">Cards show today; charts and breakdowns follow the selected range. Visitors are distinct anonymous session IDs, not identified people. Duration measures observed active time for today’s visitors.</p>
      <Section title="Traffic"><div className="mb-3 text-xs text-slate-400">Page views and visitors · Dubai {range === 'today' ? 'hours' : 'calendar days'}</div>{data.traffic.some(row => row.views > 0) ? <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.traffic} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}><CartesianGrid stroke="#1e293b" vertical={false} /><XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} /><YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} /><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} /><Area isAnimationActive={false} name="Page views" dataKey="views" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.12} /><Area isAnimationActive={false} name="Visitors" dataKey="visitors" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.06} /></AreaChart></ResponsiveContainer></div> : empty}</Section>
      <Section title={`Live Visitors · ${data.metrics.online}`}><p className="mb-4 text-xs text-slate-400">Seen in the past 90 seconds. Showing up to 100 sessions.</p>{data.live.length ? <div className="overflow-x-auto"><table className="w-full whitespace-nowrap text-left text-xs"><thead className="text-slate-500"><tr>{['Session','Current page','Country','Device / browser','Source','Duration','Last activity'].map(label => <th key={label} className="px-3 pb-3 font-medium">{label}</th>)}</tr></thead><tbody>{data.live.map(row => <tr key={row.session_id} className="border-t border-slate-800"><td className="px-3 py-4"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />{row.session_id.slice(0,8)}</td><td className="px-3">{row.last_path}</td><td className="px-3">{row.country || 'Unknown'}</td><td className="px-3">{row.device} / {row.browser}</td><td className="px-3">{row.source || row.referrer || 'Direct'}</td><td className="px-3">{duration(row.duration)}</td><td className="px-3">{time(row.last_seen)}</td></tr>)}</tbody></table></div> : empty}</Section>
      <div className="grid gap-6 lg:grid-cols-2"><Section title="Top Pages">{data.pages.length ? <div className="space-y-4"><div className="flex justify-between text-xs text-slate-500"><span>Path</span><span>Views / visitors</span></div>{data.pages.map(row => <div key={row.path} className="flex justify-between gap-4 border-t border-slate-800 pt-3 text-sm"><span className="break-all text-slate-300">{row.path}</span><span className="shrink-0">{row.views} / {row.visitors}</span></div>)}</div> : empty}</Section>
      <Section title="Tool Usage">{data.tools.length ? <div className="space-y-4">{data.tools.map(row => <div key={row.name} className="border-b border-slate-800 pb-3"><div className="flex justify-between gap-3 text-sm"><span className="text-slate-300">{row.name}</span><span>{row.runs} · {row.percentage}%</span></div><p className="mt-2 text-xs text-slate-500">Success {row.succeeded} · Failed {row.failed} · Outcome unreported {row.unknown}</p></div>)}</div> : empty}</Section></div>
      <div className="grid gap-6 md:grid-cols-3"><Section title="Acquisition"><Distribution rows={data.acquisition} /></Section><Section title="Geography"><Distribution rows={data.geography} /></Section><Section title="Devices"><Distribution rows={data.devices} /></Section></div>
      <Section title="Recent Activity">{data.activity.length ? <div className="max-h-96 space-y-3 overflow-y-auto">{data.activity.map(row => <div key={row.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-3 text-xs"><div><span className="mr-3 text-cyan-300">{row.event_type.replaceAll('_',' ')}</span><span className="text-slate-300">{row.tool_slug || row.path}</span>{row.event_type === 'tool_execution' && <span className="ml-2 text-slate-500">{row.success === null ? 'Outcome unreported' : row.success ? 'Success' : 'Failed'}</span>}<span className="ml-3 text-slate-500">{row.session_id.slice(0,8)}</span></div><time className="text-slate-500">{time(row.created_at)}</time></div>)}</div> : empty}</Section>
    </div>}
  </div>;
}
