import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { Users, FileText, MapPin, RefreshCw, CheckCircle2, XCircle, Clock, Trophy, Mail, Download } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import GoalsSection from '@/components/GoalsSection';

function KPI({ icon: Icon, label, value, tone }) {
  const tones = { slate: 'text-slate-900', sky: 'text-sky-600', amber: 'text-amber-600', green: 'text-green-600', red: 'text-red-600' };
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{label}</p>
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${tones[tone] || tones.slate}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingSummary, setSendingSummary] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [regs, agents, sessions] = await Promise.all([
        supabaseApi.entities.Registration.list('-created_date', 500),
        supabaseApi.entities.User.list('-created_date', 200),
        supabaseApi.entities.LocationSession.filter({ status: 'active' }, '-started_at', 50),
      ]);
      const fieldAgents = agents.filter((u) => u.role === 'field_agent');
      const todayStr = new Date().toISOString().slice(0, 10);
      const today = regs.filter((r) => (r.created_date || '').slice(0, 10) === todayStr);
      const verified = regs.filter((r) => r.verification_status === 'verified');
      const rejected = regs.filter((r) => r.status === 'rejected');
      const pendingReview = regs.filter((r) => r.verification_status === 'unverified');

      // daily volume (last 7 days)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        days.push({ date: ds.slice(5), count: regs.filter((r) => (r.created_date || '').slice(0, 10) === ds).length });
      }

      // agent activity
      const byAgent = {};
      regs.forEach((r) => { byAgent[r.created_by_id] = (byAgent[r.created_by_id] || 0) + 1; });
      const agentActivity = fieldAgents.map((a) => ({ name: a.full_name || a.email, count: byAgent[a.id] || 0 })).sort((a, b) => b.count - a.count).slice(0, 6);

      // Monthly leaderboard
      const monthStr = new Date().toISOString().slice(0, 7);
      const monthRegs = regs.filter((r) => (r.created_date || '').slice(0, 7) === monthStr);
      const byAgentMonth = {};
      monthRegs.forEach((r) => { byAgentMonth[r.created_by_id] = (byAgentMonth[r.created_by_id] || 0) + 1; });
      const leaderboard = fieldAgents.map((a) => ({ name: a.full_name || a.email, count: byAgentMonth[a.id] || 0 })).sort((a, b) => b.count - a.count).slice(0, 5);

      // County breakdown
      const byCounty = {};
      regs.forEach((r) => { if (r.county) byCounty[r.county] = (byCounty[r.county] || 0) + 1; });
      const countyBreakdown = Object.entries(byCounty).map(([county, count]) => ({ county, count })).sort((a, b) => b.count - a.count);

      setData({
        leaderboard, countyBreakdown,
        total: regs.length, today: today.length, pendingReview: pendingReview.length,
        verified: verified.length, rejected: rejected.length,
        activeAgents: fieldAgents.filter((a) => a.account_status !== 'suspended').length,
        activeSessions: sessions.length,
        pendingSync: regs.filter((r) => r.sync_status === 'pending_sync').length,
        days, agentActivity, recent: regs.slice(0, 8), sessions,
      });
    } catch {} finally { setLoading(false); }
  };

  const sendDailySummary = async () => {
    setSendingSummary(true);
    try {
      await supabaseApi.functions.invoke('dailySummary', {});
      toast({ title: 'Daily summary sent to admin team' });
    } catch { toast({ title: 'Failed to send summary', variant: 'destructive' }); }
    finally { setSendingSummary(false); }
  };

  const exportToSheets = async () => {
    setExporting(true);
    try {
      const res = await supabaseApi.functions.invoke('googleSheetsExport', {});
      const csv = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'registrations_export.csv'; a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Export downloaded' });
    } catch { toast({ title: 'Export failed', variant: 'destructive' }); }
    finally { setExporting(false); }
  };

  useEffect(() => {
    loadData();
    // Realtime: refresh dashboard whenever a registration is created, updated, or deleted
    const unsubscribe = supabaseApi.entities.Registration.subscribe(() => { loadData(); });
    return unsubscribe;
  }, []);

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading dashboard…</div>;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Civic Field Operational Command</h1>
        <p className="text-sm text-slate-500">Overview of field registration activity and authorized field sessions.</p>
        <button onClick={sendDailySummary} disabled={sendingSummary} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <Mail className="w-3.5 h-3.5" /> {sendingSummary ? 'Sending…' : 'Send Daily Summary'}
        </button>
        <button onClick={exportToSheets} disabled={exporting} className="mt-2 ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <Download className="w-3.5 h-3.5" /> {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* KPI band */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <KPI icon={FileText} label="Total Registrations" value={data.total} tone="slate" />
        <KPI icon={Clock} label="Today" value={data.today} tone="sky" />
        <KPI icon={MapPin} label="Active Field Sessions" value={data.activeSessions} tone="sky" />
        <KPI icon={RefreshCw} label="Pending Sync" value={data.pendingSync} tone="amber" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <KPI icon={Clock} label="Pending Review" value={data.pendingReview} tone="amber" />
        <KPI icon={CheckCircle2} label="Verified" value={data.verified} tone="green" />
        <KPI icon={XCircle} label="Rejected" value={data.rejected} tone="red" />
        <KPI icon={Users} label="Active Agents" value={data.activeAgents} tone="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Volume chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Registration Volume (7 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent activity */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Agent Activity</CardTitle></CardHeader>
          <CardContent>
            {data.agentActivity.length === 0 ? (
              <p className="text-sm text-slate-400">No activity yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.agentActivity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0f172a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals section */}
      <GoalsSection />

      {/* Monthly Leaderboard */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Monthly Leaderboard — Top Performers</CardTitle></CardHeader>
        <CardContent>
          {data.leaderboard.length === 0 || data.leaderboard.every((l) => l.count === 0) ? (
            <p className="text-sm text-slate-400">No registrations this month yet.</p>
          ) : (
            <div className="space-y-2">
              {data.leaderboard.map((l, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{l.name}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{l.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* County Breakdown */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-600" /> Registrations by County</CardTitle></CardHeader>
        <CardContent>
          {data.countyBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.countyBreakdown.map((c) => {
                const pct = data.total > 0 ? (c.count / data.total) * 100 : 0;
                return (
                  <div key={c.county}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-700">{c.county}</p>
                      <span className="text-xs text-slate-500">{c.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live activity feed */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Live Field Activity</CardTitle></CardHeader>
        <CardContent>
          {data.recent.length === 0 ? (
            <p className="text-sm text-slate-400">No registrations yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recent.map((r) => (
                <div key={r.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.first_name} {r.surname}</p>
                    <p className="text-xs text-slate-500">{r.ward}, {r.county} · {r.created_by}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${r.verification_status === 'verified' ? 'bg-green-100 text-green-700' : r.verification_status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {r.verification_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}