import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Headphones, Search } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { logAudit } from '@/lib/audit';

const STATUS_CLS = { open: 'bg-blue-100 text-blue-700', in_progress: 'bg-amber-100 text-amber-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-slate-100 text-slate-600' };
const PRIORITY_CLS = { low: 'bg-slate-100 text-slate-600', medium: 'bg-blue-100 text-blue-700', high: 'bg-amber-100 text-amber-700', urgent: 'bg-red-100 text-red-700' };

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [active, setActive] = useState(null);
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.SupportTicket.list('-created_date', 200);
      setTickets(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return `${t.subject} ${t.description} ${t.agent_name || ''}`.toLowerCase().includes(q);
    }
    return true;
  });

  const openTicket = (t) => { setActive(t); setResponse(t.admin_response || ''); };

  const saveResponse = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await supabaseApi.entities.SupportTicket.update(active.id, {
        admin_response: response,
        status: response ? 'resolved' : 'in_progress',
      });
      await logAudit('support_ticket_responded', active.id);
      toast({ title: 'Response saved' });
      setActive(null);
      load();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const updateStatus = async (t, status) => {
    await supabaseApi.entities.SupportTicket.update(t.id, { status });
    load();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Headphones className="w-5 h-5 text-slate-700" /> Support Dashboard
        </h1>
        <p className="text-sm text-slate-500">View, categorize, and respond to support tickets from field agents.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets…" className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-sm text-slate-400">No support tickets found.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openTicket(t)}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{t.subject}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.agent_name || 'Unknown agent'} · {t.category}</p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{t.description}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_CLS[t.status] || ''}`}>{t.status}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_CLS[t.priority] || ''}`}>{t.priority}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{active?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">From</p>
              <p className="text-sm font-medium">{active?.agent_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Description</p>
              <p className="text-sm text-slate-700">{active?.description}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Response</p>
              <Textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Type your response…" rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => active && updateStatus(active, 'closed')}>Close Ticket</Button>
            <Button onClick={saveResponse} disabled={saving}>{saving ? 'Saving…' : 'Send Response'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}