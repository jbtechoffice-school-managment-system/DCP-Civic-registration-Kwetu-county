import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Search, CheckCircle2, Flag, Clock } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { logAudit } from '@/lib/audit';

export default function VerificationQueue() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Registration.filter({ verification_status: 'unverified' }, '-created_date', 200);
      setRecords(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return `${r.first_name} ${r.surname} ${r.id_number} ${r.community} ${r.ward}`.toLowerCase().includes(q);
  });

  const openRecord = (r) => { setActive(r); setNotes(r.notes || ''); };

  const verify = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await supabaseApi.entities.Registration.update(active.id, { verification_status: 'verified', status: 'verified', notes });
      await logAudit('registration_verified', active.id);
      toast({ title: 'Registration verified' });
      setActive(null);
      load();
    } catch { toast({ title: 'Verification failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const flag = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await supabaseApi.entities.Registration.update(active.id, { verification_status: 'flagged', notes });
      await logAudit('registration_flagged', active.id, notes);
      toast({ title: 'Registration flagged for review' });
      setActive(null);
      load();
    } catch { toast({ title: 'Flag failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" /> Verification Queue
        </h1>
        <p className="text-sm text-slate-500">Review unverified registrations — confirm accuracy or flag for inspection.</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, ID, community…" className="pl-9" />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">All caught up!</p>
          <p className="text-xs text-slate-400 mt-1">No unverified registrations in the queue.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openRecord(r)}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{r.first_name} {r.surname}</p>
                    <p className="text-xs text-slate-500">{r.community}, {r.ward}, {r.county}</p>
                    {r.id_number && <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {r.id_number}</p>}
                  </div>
                  <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700 shrink-0">Unverified</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Verify Registration</DialogTitle></DialogHeader>
          {active && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-slate-500">Name</p><p className="font-medium">{active.first_name} {active.surname}</p></div>
                <div><p className="text-xs text-slate-500">ID Number</p><p className="font-medium font-mono">{active.id_number || '—'}</p></div>
                <div><p className="text-xs text-slate-500">Location</p><p className="font-medium">{active.community}, {active.ward}</p></div>
                <div><p className="text-xs text-slate-500">Contact</p><p className="font-medium">{active.contact_number || '—'}</p></div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Notes</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add verification notes…" rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={flag} disabled={saving}>
              <Flag className="w-4 h-4 mr-2" /> Flag
            </Button>
            <Button onClick={verify} disabled={saving}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> {saving ? 'Saving…' : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}