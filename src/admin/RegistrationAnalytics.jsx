import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, AreaChart, Area } from 'recharts';
import { TrendingUp, Clock, MapPin } from 'lucide-react';

export default function RegistrationAnalytics() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await supabaseApi.entities.Registration.list('-created_date', 1000);
        setRegs(data);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const dailyData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const count = regs.filter((r) => (r.created_date || '').slice(0, 10) === ds).length;
      days.push({ date: ds.slice(5), count });
    }
    return days;
  }, [regs]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, count: 0 }));
    regs.forEach((r) => {
      const h = new Date(r.created_date).getHours();
      hours[h].count++;
    });
    return hours;
  }, [regs]);

  const wardData = useMemo(() => {
    const map = {};
    regs.forEach((r) => { const w = r.ward || 'Unknown'; map[w] = (map[w] || 0) + 1; });
    return Object.entries(map).map(([ward, count]) => ({ ward, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [regs]);

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading analytics…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registration Analytics</h1>
        <p className="text-sm text-slate-500">Visualizing registration trends over time to understand peak activity periods.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-sky-600" /> Registration Volume (30 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyData}>
                <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0284c7" stopOpacity={0.3} /><stop offset="100%" stopColor="#0284c7" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#0284c7" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-sky-600" /> Peak Hours</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 8 }} stroke="#94a3b8" interval={3} />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-600" /> Top Wards by Registration Count</CardTitle></CardHeader>
        <CardContent>
          {wardData.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={wardData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <YAxis type="category" dataKey="ward" tick={{ fontSize: 10 }} stroke="#94a3b8" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f172a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}