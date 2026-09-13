import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Archive, RotateCcw, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/ui/use-toast';
import { logAudit } from '@/lib/audit';

export default function RegistrationArchive() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setRegs(await supabaseApi.entities.Registration.list('-created_date', 1000)); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const archived = regs.filter((r) => r.status === 'rejected' || r.verification_status === 'flagged');

  const restore = async (r) => {
    await supabaseApi.entities.Registration.update(r.id, { status: 'pending', verification_status: 'unverified' });
    await logAudit('registration_restored', r.id);
    toast({ title: 'Registration restored' });
    load();
  };

  const permanentDelete = async (r) => {
    await supabaseApi.entities.Registration.delete(r.id);
    await logAudit('registration_deleted', r.id);
    toast({ title: 'Registration permanently deleted' });
    load();
  };

  return (
    <div className="p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Archive className="w-6 h-6 text-slate-600" /> Registration Archive</h1>
        <p className="text-sm text-slate-500">View and manage registrations that have been rejected or flagged for follow-up.</p>
      </div>
      {loading ? <p className="text-sm text-slate-400">Loading…</p> : archived.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-slate-400">No archived registrations.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {archived.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.first_name} {r.surname}</p>
                  <p className="text-xs text-slate-500">{r.community}, {r.ward} · {r.created_date?.slice(0, 10)}</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant={r.status === 'rejected' ? 'destructive' : 'default'}>{r.status}</Badge>
                    <Badge variant={r.verification_status === 'flagged' ? 'destructive' : 'secondary'}>{r.verification_status}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => restore(r)}><RotateCcw className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => permanentDelete(r)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}