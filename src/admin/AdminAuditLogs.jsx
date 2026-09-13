import { useEffect, useMemo, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Input } from '@/ui/input';
import { Card, CardContent } from '@/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Search } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const all = await supabaseApi.entities.AuditLog.list('-created_date', 500);
        setLogs(all);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const actions = useMemo(() => Array.from(new Set(logs.map((l) => l.action))), [logs]);

  const filtered = logs.filter((l) => {
    if (actionFilter !== 'all' && l.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return `${l.action} ${l.actor_email} ${l.details} ${l.record_id}`.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500">Immutable record of significant system events.</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search actor, action, details…" className="pl-9" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actions.map((a) => <SelectItem key={a} value={a}>{a.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-slate-100">
            {filtered.length === 0 ? <p className="p-6 text-center text-sm text-slate-400">No audit entries.</p> :
              filtered.map((l) => (
                <div key={l.id} className="p-3 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{l.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500">{l.actor_email} · {l.created_date}</p>
                    {l.details && <p className="text-xs text-slate-400 mt-0.5">{l.details}</p>}
                  </div>
                  {l.record_id && <span className="text-[10px] font-mono text-slate-400 shrink-0">{l.record_id.slice(-8)}</span>}
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}