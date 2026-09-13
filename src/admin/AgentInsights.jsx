import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { TrendingUp, Target, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/ui/button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

export default function AgentInsights() {
  const [agents, setAgents] = useState([]);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [users, allRegs] = await Promise.all([
          supabaseApi.entities.User.list('-created_date', 200),
          supabaseApi.entities.Registration.list('-created_date', 1000),
        ]);
        setAgents(users.filter((u) => u.role === 'field_agent'));
        setRegs(allRegs);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const agentStats = useMemo(() => {
    const map = {};
    agents.forEach((a) => {
      map[a.id] = { name: a.full_name || a.email, total: 0, verified: 0, rejected: 0, pending: 0, trend: [] };
    });
    regs.forEach((r) => {
      if (!map[r.created_by_id]) return;
      const s = map[r.created_by_id];
      s.total++;
      if (r.verification_status === 'verified') s.verified++;
      else if (r.verification_status === 'flagged') s.rejected++;
      else s.pending++;
      const day = (r.created_date || '').slice(0, 10);
      const t = s.trend.find((x) => x.date === day);
      if (t) t.count++;
      else s.trend.push({ date: day, count: 1 });
    });
    Object.values(map).forEach((s) => {
      s.conversionRate = s.total > 0 ? Math.round((s.verified / s.total) * 100) : 0;
      s.trend.sort((a, b) => a.date.localeCompare(b.date));
    });
    return map;
  }, [agents, regs]);

  const chartData = Object.entries(agentStats).map(([id, s]) => ({
    name: s.name?.split(' ')[0] || 'Unknown',
    total: s.total,
    verified: s.verified,
  }));

  const selectedTrend = selectedAgent ? agentStats[selectedAgent]?.trend || [] : [];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Agent Performance Insights</h1>
        <p className="text-sm text-slate-500">Compare individual agent performance, conversion rates, and trends.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Registrations by Agent</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="verified" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(agentStats).map(([id, s]) => (
              <Card key={id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 text-sm truncate">{s.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.conversionRate >= 70 ? 'bg-green-100 text-green-700' : s.conversionRate >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {s.conversionRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{s.total} total</span>
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3 h-3" />{s.verified}</span>
                    <span className="flex items-center gap-1 text-red-600"><XCircle className="w-3 h-3" />{s.rejected}</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setSelectedAgent(id)}>
                    <Clock className="w-3 h-3 mr-1" />View Trend
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedAgent && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Historical Trend — {agentStats[selectedAgent]?.name}</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedAgent('')}>Close</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}