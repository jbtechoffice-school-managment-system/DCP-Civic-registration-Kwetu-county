import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Input } from '@/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Shield, Search } from 'lucide-react';

const ACTION_CATEGORIES = [
  { value: 'all', label: 'All Actions' },
  { value: 'registration', label: 'Registrations' },
  { value: 'role', label: 'Role Changes' },
  { value: 'export', label: 'Exports' },
  { value: 'verification', label: 'Verifications' },
  { value: 'bulk', label: 'Bulk Operations' },
  { value: 'login', label: 'Authentication' },
];

export default function SecurityAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const all = await supabaseApi.entities.AuditLog.list('-created_date', 500);
        setLogs(all);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    let r = logs;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((l) => `${l.action} ${l.actor_email} ${l.details || ''}`.toLowerCase().includes(q));
    }
    if (category !== 'all') {
      r = r.filter((l) => (l.action || '').toLowerCase().includes(category));
    }
    return r;
  }, [logs, search, category]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2"><Shield className="w-5 h-5 text-slate-700" />Security Audit Log</h1>
        <p className="text-sm text-slate-500">Tracks all sensitive actions: role changes, exports, verifications, and more.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search action, user, details…" className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ACTION_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-slate-400">No audit events found.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((l) => (
            <Card key={l.id}>
              <CardContent className="p-3 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${(l.action || '').includes('flag') ? 'bg-red-500' : (l.action || '').includes('verified') ? 'bg-green-500' : (l.action || '').includes('export') ? 'bg-amber-500' : 'bg-sky-500'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 capitalize">{(l.action || '').replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-500">{l.actor_email || '—'}</p>
                  {l.details && <p className="text-xs text-slate-400 mt-0.5">{l.details}</p>}
                  <p className="text-[11px] text-slate-400 font-mono mt-1">{(l.created_date || '').slice(0, 19).replace('T', ' ')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}