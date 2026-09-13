import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Input } from '@/ui/input';
import { History, Play, Pause, Square, Search } from 'lucide-react';

function duration(start, end) {
  if (!start || !end) return '—';
  const ms = new Date(end) - new Date(start);
  if (isNaN(ms) || ms < 0) return '—';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const statusIcon = {
  active: <Play className="w-3.5 h-3.5 text-sky-600" />,
  paused: <Pause className="w-3.5 h-3.5 text-amber-600" />,
  stopped: <Square className="w-3.5 h-3.5 text-slate-400" />,
};

export default function FieldSessionLog() {
  const [sessions, setSessions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wardFilter, setWardFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([
          supabaseApi.entities.LocationSession.list('-started_at', 500),
          supabaseApi.entities.User.list('-created_date', 200),
        ]);
        setSessions(s);
        setAgents(a.filter((u) => u.role === 'field_agent'));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a]));

  const uniqueWards = useMemo(() => {
    const set = new Set();
    sessions.forEach((s) => { if (s.ward) set.add(s.ward); });
    return Array.from(set).sort();
  }, [sessions]);

  const filtered = useMemo(() => {
    let r = sessions;
    if (wardFilter !== 'all') r = r.filter((s) => s.ward === wardFilter);
    if (agentFilter !== 'all') r = r.filter((s) => s.agent_id === agentFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((s) => {
        const name = agentMap[s.agent_id]?.full_name || '';
        return `${name} ${s.ward || ''} ${s.status}`.toLowerCase().includes(q);
      });
    }
    return r;
  }, [sessions, wardFilter, agentFilter, search, agentMap]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Field Session Log</h1>
        <p className="text-sm text-slate-500">Historical record of all field location sessions.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agent, ward…" className="pl-9" />
        </div>
        <Select value={wardFilter} onValueChange={setWardFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Ward" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All wards</SelectItem>
            {uniqueWards.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Agent" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name || a.email}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No sessions match your filters.</p>
        </CardContent></Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border border-slate-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Agent</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Started</th>
                  <th className="text-left px-4 py-3 font-medium">Ended</th>
                  <th className="text-left px-4 py-3 font-medium">Duration</th>
                  <th className="text-left px-4 py-3 font-medium">Ward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{agentMap[s.agent_id]?.full_name || 'Unknown'}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-xs font-medium">{statusIcon[s.status] || statusIcon.stopped}{s.status}</span></td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{(s.started_at || '').slice(0, 16).replace('T', ' ') || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{(s.ended_at || '').slice(0, 16).replace('T', ' ') || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{duration(s.started_at, s.ended_at)}</td>
                    <td className="px-4 py-3 text-slate-600">{s.ward || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 text-sm">{agentMap[s.agent_id]?.full_name || 'Unknown'}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium">{statusIcon[s.status] || statusIcon.stopped}{s.status}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Start: {(s.started_at || '').slice(0, 16).replace('T', ' ') || '—'}</span>
                    <span>Duration: {duration(s.started_at, s.ended_at)}</span>
                  </div>
                  <p className="text-xs text-slate-600">Ward: {s.ward || '—'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}