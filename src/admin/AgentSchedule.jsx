import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { CalendarDays, Play, Square } from 'lucide-react';

export default function AgentSchedule() {
  const [agents, setAgents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [users, sess] = await Promise.all([
          supabaseApi.entities.User.list('-created_date', 200),
          supabaseApi.entities.LocationSession.list('-started_at', 500),
        ]);
        setAgents(users.filter((u) => u.role === 'field_agent'));
        setSessions(sess);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const sessionsByAgent = {};
  sessions.forEach((s) => {
    if (!sessionsByAgent[s.agent_id]) sessionsByAgent[s.agent_id] = [];
    sessionsByAgent[s.agent_id].push(s);
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agent Schedule</h1>
        <p className="text-sm text-slate-500">Field days per agent, derived from location session history.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : agents.length === 0 ? (
        <p className="text-sm text-slate-400">No field agents found.</p>
      ) : (
        <div className="grid gap-3">
          {agents.map((a) => {
            const agentSessions = (sessionsByAgent[a.id] || []).sort((x, y) => (y.started_at || '').localeCompare(x.started_at || ''));
            const workedToday = agentSessions.some((s) => (s.started_at || '').slice(0, 10) === today);
            return (
              <Card key={a.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{a.full_name || a.email}</p>
                      <p className="text-xs text-slate-500">{agentSessions.length} total field day{agentSessions.length !== 1 ? 's' : ''}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${workedToday ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {workedToday ? 'Active today' : 'Not active today'}
                    </span>
                  </div>
                  {agentSessions.length === 0 ? (
                    <p className="text-xs text-slate-400">No field sessions recorded.</p>
                  ) : (
                    <div className="space-y-1">
                      {agentSessions.slice(0, 5).map((s) => (
                        <div key={s.id} className="flex items-center gap-2 text-xs text-slate-600">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{(s.started_at || '').slice(0, 10)}</span>
                          {s.status === 'active' ? <Play className="w-3 h-3 text-sky-500" /> : <Square className="w-3 h-3 text-slate-300" />}
                          <span className="text-slate-400">{s.ward || '—'}</span>
                        </div>
                      ))}
                      {agentSessions.length > 5 && <p className="text-xs text-slate-400 mt-1">+{agentSessions.length - 5} more sessions</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}