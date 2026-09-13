import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';

export default function AgentLeaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [users, regs] = await Promise.all([
          supabaseApi.entities.User.list('-created_date', 200),
          supabaseApi.entities.Registration.list('-created_date', 1000),
        ]);
        const agents = users.filter((u) => u.role === 'field_agent');
        const counts = {};
        regs.forEach((r) => { counts[r.created_by_id] = (counts[r.created_by_id] || 0) + 1; });
        const ranked = agents
          .map((a) => ({ ...a, count: counts[a.id] || 0 }))
          .sort((x, y) => y.count - x.count);
        setRows(ranked);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const medal = (i) => {
    if (i === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (i === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (i === 2) return <Award className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-medium text-slate-400 w-5 text-center">{i + 1}</span>;
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agent Leaderboard</h1>
        <p className="text-sm text-slate-500">Top performers ranked by total registrations.</p>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-400">No agents found.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((a, i) => (
            <Card key={a.id} className={i < 3 ? 'border-2 ' + (i === 0 ? 'border-yellow-300' : i === 1 ? 'border-gray-200' : 'border-amber-200') : ''}>
              <CardContent className="p-4 flex items-center gap-4">
                {medal(i)}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{a.full_name || a.email}</p>
                  <p className="text-xs text-slate-500">{a.operating_area || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{a.count}</p>
                  <p className="text-xs text-slate-500">registrations</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}