import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Search, UserCheck, UserX } from 'lucide-react';
import { logAudit } from '@/lib/audit';
import { useToast } from '@/ui/use-toast';

export default function AdminAgents() {
  const { toast } = useToast();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [agentRegs, setAgentRegs] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  const [regCounts, setRegCounts] = useState({});
  const load = async () => {
    setLoading(true);
    try {
      const [users, regs] = await Promise.all([
        supabaseApi.entities.User.list('-created_date', 200),
        supabaseApi.entities.Registration.list('-created_date', 1000),
      ]);
      const fieldAgents = users.filter((u) => u.role === 'field_agent');
      const counts = {};
      regs.forEach((r) => { counts[r.created_by_id] = (counts[r.created_by_id] || 0) + 1; });
      setRegCounts(counts);
      setAgents(fieldAgents);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAgent = async (a) => {
    setSelected(a);
    setLoadingRegs(true);
    setAgentRegs([]);
    try {
      const regs = await supabaseApi.entities.Registration.filter({ created_by_id: a.id }, '-created_date', 50);
      setAgentRegs(regs);
    } catch {} finally { setLoadingRegs(false); }
  };

  const toggleSuspend = async (a) => {
    const next = a.account_status === 'suspended' ? 'active' : 'suspended';
    await supabaseApi.entities.User.update(a.id, { account_status: next });
    await logAudit(next === 'suspended' ? 'agent_suspended' : 'agent_reactivated', a.id, a.email);
    toast({ title: next === 'suspended' ? 'Agent suspended' : 'Agent reactivated' });
    load();
  };

  const filtered = agents.filter((a) =>
    `${a.full_name} ${a.email} ${a.operating_area} ${a.agent_reference}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agents</h1>
        <p className="text-sm text-slate-500">Field agents registered in the system.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agents…" className="pl-9" />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Agent</th>
                <th className="text-left px-4 py-3 font-medium">Reference</th>
                <th className="text-left px-4 py-3 font-medium">Operating Area</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Registrations</th>
                <th className="text-left px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openAgent(a)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{a.full_name || '—'}</p>
                    <p className="text-xs text-slate-500">{a.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{a.agent_reference || '—'}</td>
                  <td className="px-4 py-3">{a.operating_area || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${a.account_status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {a.account_status === 'suspended' ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{regCounts[a.id] || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleSuspend(a); }}>
                      {a.account_status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No agents found.</p>}
        </div>
      )}

      {/* Agent detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.full_name || 'Agent'}</DialogTitle>
            <DialogDescription>{selected?.email} · REF {selected?.agent_reference || '—'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-slate-500">Phone</p><p className="font-medium">{selected?.phone || '—'}</p></div>
              <div><p className="text-xs text-slate-500">Operating area</p><p className="font-medium">{selected?.operating_area || '—'}</p></div>
              <div><p className="text-xs text-slate-500">Account status</p><p className="font-medium">{selected?.account_status}</p></div>
              <div><p className="text-xs text-slate-500">Registrations</p><p className="font-medium">{agentRegs.length}</p></div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Registrations by this agent</p>
              {loadingRegs ? (
                <p className="text-sm text-slate-400">Loading…</p>
              ) : agentRegs.length === 0 ? (
                <p className="text-sm text-slate-400">No registrations submitted.</p>
              ) : (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {agentRegs.map((r) => (
                    <div key={r.id} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{r.first_name} {r.surname}</p>
                        <p className="text-xs text-slate-500">{r.community}, {r.ward} · {(r.created_date || '').slice(0, 10)}</p>
                      </div>
                      <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${r.verification_status === 'verified' ? 'bg-green-100 text-green-700' : r.verification_status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {r.verification_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}