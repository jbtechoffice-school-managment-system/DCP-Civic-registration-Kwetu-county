import { useEffect, useMemo, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Search, CheckCircle2, XCircle, Flag } from 'lucide-react';
import { COUNTIES } from '@/lib/geo';
import { logAudit } from '@/lib/audit';
import { useToast } from '@/ui/use-toast';

const PAGE_SIZE = 15;

export default function AdminRegistrations() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [audit, setAudit] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Registration.list('-created_date', 500);
      setRecords(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let r = records;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => `${x.first_name} ${x.surname} ${x.community} ${x.ward} ${x.constituency} ${x.created_by}`.toLowerCase().includes(q));
    }
    if (county !== 'all') r = r.filter((x) => x.county === county);
    if (status !== 'all') {
      r = r.filter((x) => {
        if (status === 'verified') return x.verification_status === 'verified';
        if (status === 'flagged') return x.verification_status === 'flagged';
        if (status === 'unverified') return x.verification_status === 'unverified';
        return true;
      });
    }
    return r;
  }, [records, search, county, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const openRecord = async (r) => {
    setSelected(r);
    setAudit([]);
    try {
      const logs = await supabaseApi.entities.AuditLog.filter({ record_id: r.id }, 'created_date', 50);
      setAudit(logs);
    } catch {}
  };

  const setVerification = async (r, verification_status) => {
    const statusMap = { verified: 'verified', flagged: 'pending', unverified: 'pending' };
    await supabaseApi.entities.Registration.update(r.id, {
      verification_status,
      status: statusMap[verification_status] || r.status,
    });
    await logAudit(`registration_${verification_status}`, r.id, `${r.first_name} ${r.surname}`);
    toast({ title: `Marked ${verification_status}` });
    load();
    setSelected((s) => s && s.id === r.id ? { ...s, verification_status } : s);
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registrations</h1>
        <p className="text-sm text-slate-500">All authorized community registrations across agents.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, ward, agent…" className="pl-9" />
        </div>
        <Select value={county} onValueChange={(v) => { setCounty(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="County" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All counties</SelectItem>
            {COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="unverified">Pending review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
                <th className="text-left px-4 py-3 font-medium">Agent</th>
                <th className="text-left px-4 py-3 font-medium">Date & Time</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openRecord(r)}>
                  <td className="px-4 py-3 font-medium text-slate-900">{r.first_name} {r.surname}</td>
                  <td className="px-4 py-3 text-slate-600">{r.ward}, {r.county}</td>
                  <td className="px-4 py-3 text-slate-600">{r.created_by}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{(r.created_date || '').slice(0, 16).replace('T', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${r.verification_status === 'verified' ? 'bg-green-100 text-green-700' : r.verification_status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                      {r.verification_status}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button title="Verify" onClick={() => setVerification(r, 'verified')} className="p-1 rounded hover:bg-green-50 text-green-600"><CheckCircle2 className="w-4 h-4" /></button>
                      <button title="Flag" onClick={() => setVerification(r, 'flagged')} className="p-1 rounded hover:bg-red-50 text-red-600"><Flag className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageItems.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No records found.</p>}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</Button>
          <span className="text-xs text-slate-500">Page {current} of {pages}</span>
          <Button variant="outline" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.first_name} {selected.surname}</DialogTitle>
                <DialogDescription className="font-mono">ID {selected.id}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-slate-500">Contact</p><p className="font-medium">{selected.contact_number || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">Gender</p><p className="font-medium">{selected.gender || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">County</p><p className="font-medium">{selected.county}</p></div>
                  <div><p className="text-xs text-slate-500">Constituency</p><p className="font-medium">{selected.constituency}</p></div>
                  <div><p className="text-xs text-slate-500">Ward</p><p className="font-medium">{selected.ward}</p></div>
                  <div><p className="text-xs text-slate-500">Community</p><p className="font-medium">{selected.community}</p></div>
                  <div><p className="text-xs text-slate-500">Station</p><p className="font-medium">{selected.station || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">Consent</p><p className="font-medium">{selected.consent_given ? 'Yes' : 'No'}</p></div>
                  <div><p className="text-xs text-slate-500">Submitted by</p><p className="font-medium">{selected.created_by}</p></div>
                  <div><p className="text-xs text-slate-500">Registered At</p><p className="font-medium font-mono text-xs">{(selected.created_date || '').slice(0, 19).replace('T', ' ')}</p></div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setVerification(selected, 'verified')} className="text-green-600"><CheckCircle2 className="w-4 h-4 mr-1" />Verify</Button>
                  <Button size="sm" variant="outline" onClick={() => setVerification(selected, 'flagged')} className="text-red-600"><Flag className="w-4 h-4 mr-1" />Flag</Button>
                  <Button size="sm" variant="outline" onClick={() => setVerification(selected, 'unverified')}><XCircle className="w-4 h-4 mr-1" />Reset</Button>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Audit Timeline</p>
                  {audit.length === 0 ? (
                    <p className="text-sm text-slate-400">No audit events recorded.</p>
                  ) : (
                    <div className="border-l-2 border-slate-200 pl-3 space-y-2">
                      {audit.map((a) => (
                        <div key={a.id} className="text-xs">
                          <p className="font-medium text-slate-900">{a.action.replace(/_/g, ' ')}</p>
                          <p className="text-slate-500">{a.actor_email} · {a.created_date}</p>
                          {a.details && <p className="text-slate-400">{a.details}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}