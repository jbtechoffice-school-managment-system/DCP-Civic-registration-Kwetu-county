import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';

const NJIRU_COMMUNITIES = ['Njiru Town', 'Kamulu', 'Joska', 'Saika Estate', 'Mihango', 'Fedha', 'Hunters', 'Gitaru'];

export default function CommunityAnalytics() {
  const navigate = useNavigate();
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await supabaseApi.entities.Registration.filter({ county: 'Nairobi', constituency: 'Kasarani', ward: 'Njiru' }, '-created_date', 1000);
        setRegs(data);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const byCommunity = useMemo(() => {
    const map = {};
    NJIRU_COMMUNITIES.forEach((c) => map[c] = { community: c, count: 0, verified: 0, pending: 0 });
    regs.forEach((r) => {
      const c = r.community || 'Unknown';
      if (!map[c]) map[c] = { community: c, count: 0, verified: 0, pending: 0 };
      map[c].count++;
      if (r.verification_status === 'verified') map[c].verified++;
      else map[c].pending++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [regs]);

  return (
    <div className="p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Community Analytics — Njiru Ward</h1>
        <p className="text-sm text-slate-500">Registration counts and progress broken down by community within Njiru ward, Kasarani constituency.</p>
      </div>
      {loading ? <p className="text-sm text-slate-400">Loading…</p> : (
        <>
          <div className="grid grid-cols-4 gap-3">
            <Card><CardContent className="p-3"><p className="text-[11px] uppercase text-slate-500">Total</p><p className="text-2xl font-bold text-slate-900">{regs.length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[11px] uppercase text-slate-500">Verified</p><p className="text-2xl font-bold text-green-600">{regs.filter((r) => r.verification_status === 'verified').length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[11px] uppercase text-slate-500">Pending</p><p className="text-2xl font-bold text-amber-600">{regs.filter((r) => r.verification_status === 'unverified').length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[11px] uppercase text-slate-500">Communities</p><p className="text-2xl font-bold text-sky-600">{byCommunity.filter((c) => c.count > 0).length}</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Registrations by Community</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byCommunity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="community" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Community Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {byCommunity.map((c) => (
                  <div key={c.community} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                    <span className="text-sm font-medium text-slate-900">{c.community}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-green-600">✓ {c.verified}</span>
                      <span className="text-xs text-amber-600">⏳ {c.pending}</span>
                      <span className="text-sm font-bold text-slate-900">{c.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}