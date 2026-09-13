import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { Input } from '@/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { logAudit } from '@/lib/audit';
import { useCurrentUser } from '@/lib/auth-role';

const COLORS = ['#0f172a', '#0284c7', '#16a34a', '#d97706', '#dc2626', '#7c3aed'];

export default function AdminReports() {
  const { user: me } = useCurrentUser();
  const [regs, setRegs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [agentFilter, setAgentFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const [all, users] = await Promise.all([
          supabaseApi.entities.Registration.list('-created_date', 1000),
          supabaseApi.entities.User.list('-created_date', 200),
        ]);
        setRegs(all);
        setAgents(users.filter((u) => u.role === 'field_agent'));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const filtered = regs.filter((r) => {
    if (dateFrom && (r.created_date || '').slice(0, 10) < dateFrom) return false;
    if (dateTo && (r.created_date || '').slice(0, 10) > dateTo) return false;
    if (agentFilter !== 'all' && r.created_by_id !== agentFilter) return false;
    return true;
  });

  const byCounty = {};
  filtered.forEach((r) => { byCounty[r.county] = (byCounty[r.county] || 0) + 1; });
  const countyData = Object.entries(byCounty).map(([name, count]) => ({ name, count }));

  const byStatus = { unverified: 0, verified: 0, flagged: 0 };
  filtered.forEach((r) => { byStatus[r.verification_status] = (byStatus[r.verification_status] || 0) + 1; });
  const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));

  const exportCSV = async () => {
    if (me?.role !== 'admin') {
      return;
    }
    const headers = ['id','first_name','surname','contact_number','county','constituency','ward','community','status','verification_status','created_by','created_date'];
    const rows = filtered.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `registrations_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    await logAudit('export_generated', '', `registrations CSV — ${filtered.length} records`);
  };

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading reports…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Operational statistics across all authorized registrations.</p>
        </div>
        <Button onClick={exportCSV} variant="outline" disabled={me?.role !== 'admin'}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500 block mb-1">From date</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">To date</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Agent</label>
          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All agents" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name || a.email}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {(dateFrom || dateTo || agentFilter !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); setAgentFilter('all'); }}>Clear filters</Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Registrations by County</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={countyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Verification Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-4 gap-4 text-sm">
          <div><p className="text-xs text-slate-500">Total</p><p className="text-xl font-bold">{filtered.length}</p></div>
          <div><p className="text-xs text-slate-500">Verified</p><p className="text-xl font-bold text-green-600">{byStatus.verified}</p></div>
          <div><p className="text-xs text-slate-500">Pending</p><p className="text-xl font-bold text-amber-600">{byStatus.unverified}</p></div>
          <div><p className="text-xs text-slate-500">Flagged</p><p className="text-xl font-bold text-red-600">{byStatus.flagged}</p></div>
        </CardContent>
      </Card>
    </div>
  );
}