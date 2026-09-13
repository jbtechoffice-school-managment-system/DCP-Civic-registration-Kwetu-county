import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { CheckCircle2, Flag, AlertCircle } from 'lucide-react';
import { logAudit } from '@/lib/audit';
import { useToast } from '@/ui/use-toast';

export default function UnreviewedRegistrations() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Registration.list('-created_date', 500);
      setRecords(all.filter((r) => r.verification_status === 'unverified'));
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const quickVerify = async (r, status) => {
    setBusy(r.id);
    try {
      const statusMap = { verified: 'verified', flagged: 'pending' };
      await supabaseApi.entities.Registration.update(r.id, {
        verification_status: status,
        status: statusMap[status] || r.status,
      });
      await logAudit(`registration_${status}`, r.id, `${r.first_name} ${r.surname}`);
      toast({ title: `Marked ${status}` });
      setRecords((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    } finally { setBusy(null); }
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Unreviewed Registrations</h1>
        <p className="text-sm text-slate-500">Registrations pending review. Verify or flag directly without opening detail views.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : records.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">All caught up!</p>
          <p className="text-xs text-slate-400">No registrations are pending review.</p>
        </CardContent></Card>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            <span>{records.length} registration{records.length !== 1 ? 's' : ''} awaiting review</span>
          </div>
          <div className="space-y-2">
            {records.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{r.first_name} {r.surname}</p>
                    <p className="text-xs text-slate-500">{r.ward}, {r.county} · {(r.created_date || '').slice(0, 10)}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-green-600" disabled={busy === r.id} onClick={() => quickVerify(r, 'verified')}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Verify
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" disabled={busy === r.id} onClick={() => quickVerify(r, 'flagged')}>
                    <Flag className="w-3.5 h-3.5 mr-1" />Flag
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/registration-details/${r.id}`)}>Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}