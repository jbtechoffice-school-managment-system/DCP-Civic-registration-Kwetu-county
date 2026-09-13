import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { AlertCircle, Flag, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { logAudit } from '@/lib/audit';

export default function NeedsReview() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setRegs(await supabaseApi.entities.Registration.list('-created_date', 1000)); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const needsReview = regs.filter((r) => r.status === 'rejected' || r.verification_status === 'flagged');

  const approve = async (r) => {
    await supabaseApi.entities.Registration.update(r.id, { status: 'verified', verification_status: 'verified' });
    await logAudit('registration_approved', r.id);
    toast({ title: 'Registration approved' });
    load();
  };

  const reject = async (r) => {
    await supabaseApi.entities.Registration.update(r.id, { status: 'rejected', verification_status: 'flagged' });
    await logAudit('registration_rejected', r.id);
    toast({ title: 'Registration rejected' });
    load();
  };

  return (
    <div className="p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><AlertCircle className="w-6 h-6 text-amber-600" /> Needs Review</h1>
        <p className="text-sm text-slate-500">Registrations marked as rejected or flagged for follow-up. Supervisors can quickly handle problematic entries here.</p>
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading…</p> : needsReview.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" /><p className="text-sm text-slate-600">No registrations need review. All clear!</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {needsReview.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.first_name} {r.surname}</p>
                  <p className="text-xs text-slate-500">{r.community}, {r.ward}, {r.county} · {r.created_date?.slice(0, 10)}</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant={r.status === 'rejected' ? 'destructive' : 'secondary'}>{r.status}</Badge>
                    <Badge variant={r.verification_status === 'flagged' ? 'destructive' : 'outline'}>{r.verification_status}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approve(r)}><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => reject(r)}><XCircle className="w-3.5 h-3.5 mr-1" /> Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}