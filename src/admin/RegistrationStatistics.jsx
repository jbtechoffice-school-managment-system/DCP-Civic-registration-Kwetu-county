import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

const PIE_COLORS = ['#0284c7', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

export default function RegistrationStatistics() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setRegs(await supabaseApi.entities.Registration.list('-created_date', 1000));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const byCounty = {};
  regs.forEach((r) => { byCounty[r.county] = (byCounty[r.county] || 0) + 1; });
  const countyData = Object.entries(byCounty).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  const byAge = {};
  regs.forEach((r) => { const k = r.age_category || 'unknown'; byAge[k] = (byAge[k] || 0) + 1; });
  const ageData = Object.entries(byAge).map(([name, value]) => ({ name, value }));

  const byGender = {};
  regs.forEach((r) => { const k = r.gender || 'prefer_not_to_say'; byGender[k] = (byGender[k] || 0) + 1; });
  const genderData = Object.entries(byGender).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registration Statistics</h1>
        <p className="text-sm text-slate-500">Visual breakdown of registrations across counties, age groups, and gender.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : regs.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-400">No registration data yet.</p></CardContent></Card>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle className="text-sm">Registrations by County</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={countyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">By Age Category</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={ageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {ageData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">By Gender</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {genderData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}