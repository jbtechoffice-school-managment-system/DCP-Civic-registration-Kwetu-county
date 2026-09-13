import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Input } from '@/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Shield, Search } from 'lucide-react';

export default function DataIntegrityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.AuditLog.list('-created_date', 500);
      setLogs(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = logs.filter((l) => {
    if (actionFilter !== 'all' && !(l.action || '').includes(actionFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return `${l.actor_email || ''} ${l.action || ''} ${l.details || ''} ${l.record_id || ''}`.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-700" /> Data Integrity Logs
        </h1>
        <p className="text-sm text-slate-500">Audit trail of all modifications to registration records.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search actor, action, details…" className="pl-9" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="Action type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="registration">Registration</SelectItem>
            <SelectItem value="verification">Verification</SelectItem>
            <SelectItem value="message">Message</SelectItem>
            <SelectItem value="session">Session</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <p className="p-6 text-sm text-slate-400 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-slate-400 text-center">No log entries found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="text-left p-3">Timestamp</th>
                  <th className="text-left p-3">Actor</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3 hidden sm:table-cell">Record ID</th>
                  <th className="text-left p-3 hidden md:table-cell">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.slice(0, 100).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="p-3 text-xs text-slate-500 whitespace-nowrap">{(l.created_date || '').slice(0, 19).replace('T', ' ')}</td>
                    <td className="p-3 text-xs font-medium text-slate-900">{l.actor_email}</td>
                    <td className="p-3"><span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">{l.action}</span></td>
                    <td className="p-3 text-xs text-slate-500 font-mono hidden sm:table-cell">{(l.record_id || '').slice(-8)}</td>
                    <td className="p-3 text-xs text-slate-600 hidden md:table-cell max-w-xs truncate">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}