import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Badge } from '@/ui/badge';
import { Search, Phone, Mail, MapPin } from 'lucide-react';

export default function AgentDirectory() {
  const [agents, setAgents] = useState([]);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [users, registrations] = await Promise.all([
          supabaseApi.entities.User.list('-created_date', 200),
          supabaseApi.entities.Registration.list('-created_date', 500),
        ]);
        setAgents(users.filter((u) => u.role === 'field_agent'));
        setRegs(registrations);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const regCount = useMemo(() => {
    const map = {};
    regs.forEach((r) => { map[r.created_by_id] = (map[r.created_by_id] || 0) + 1; });
    return map;
  }, [regs]);

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    return (a.full_name || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q) || (a.agent_reference || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agent Directory</h1>
        <p className="text-sm text-slate-500">View, search, and manage all registered field agents.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or reference…" className="pl-9" />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading agents…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No agents found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs">
                      {(a.full_name || a.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{a.full_name || 'Unnamed'}</p>
                      <p className="text-[11px] text-slate-500 font-mono">REF {a.agent_reference || '—'}</p>
                    </div>
                  </div>
                  <Badge variant={a.account_status === 'suspended' ? 'destructive' : 'default'}>
                    {a.account_status === 'suspended' ? 'Suspended' : 'Active'}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  {a.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {a.email}</div>}
                  {a.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {a.phone}</div>}
                  {a.operating_area && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {a.operating_area}</div>}
                </div>
                <div className="pt-1 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Registrations: </span>
                  <span className="text-sm font-semibold text-slate-900">{regCount[a.id] || 0}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}