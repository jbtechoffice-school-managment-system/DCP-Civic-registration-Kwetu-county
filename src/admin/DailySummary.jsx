import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { FileText, Flag, XCircle, Mail, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/ui/use-toast';

export default function DailySummary() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Registration.list('-created_date', 1000);
      setRegs(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const dayRegs = regs.filter((r) => (r.created_date || '').slice(0, 10) === date);
  const flagged = dayRegs.filter((r) => r.verification_status === 'flagged');
  const rejected = dayRegs.filter((r) => r.status === 'rejected');
  const verified = dayRegs.filter((r) => r.verification_status === 'verified');

  const sendSummary = async () => {
    setSending(true);
    try {
      await supabaseApi.functions.invoke('dailySummary', {});
      toast({ title: 'Daily summary sent to admin team' });
    } catch { toast({ title: 'Failed to send summary', variant: 'destructive' }); }
    finally { setSending(false); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] flex items-center gap-2"><FileText className="w-5 h-5 text-[#008F4C]" /> Daily Summary</h1>
          <p className="text-sm text-[#667781]">Registration report for the selected day.</p>
        </div>
        <Button onClick={sendSummary} disabled={sending} className="bg-[#008F4C] text-white"><Mail className="w-4 h-4 mr-2" /> {sending ? 'Sending...' : 'Email Summary'}</Button>
      </div>

      <div>
        <label className="text-xs text-[#667781] mb-1.5 block">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-48" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: dayRegs.length, icon: FileText, color: 'text-[#111B21]' },
          { label: 'Verified', value: verified.length, icon: CheckCircle2, color: 'text-[#008F4C]' },
          { label: 'Flagged', value: flagged.length, icon: Flag, color: 'text-[#F7C948]' },
          { label: 'Rejected', value: rejected.length, icon: XCircle, color: 'text-[#EA4335]' },
        ].map((s) => (
          <div key={s.label} className="bg-[#F0F2F5] rounded-xl p-4">
            <div className="flex items-center justify-between mb-1"><s.icon className="w-4 h-4 text-[#667781]" /></div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#667781] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {flagged.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-[#111B21] mb-3 flex items-center gap-2"><Flag className="w-4 h-4 text-[#F7C948]" /> Flagged Submissions ({flagged.length})</p>
            <div className="space-y-2">
              {flagged.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-2 bg-[#FFF8E1] rounded-lg">
                  <div><p className="text-sm font-medium text-[#111B21]">{r.first_name} {r.surname}</p><p className="text-xs text-[#667781]">{r.ward}, {r.county}</p></div>
                  <span className="text-xs text-[#667781]">{r.notes || '—'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {rejected.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-[#111B21] mb-3 flex items-center gap-2"><XCircle className="w-4 h-4 text-[#EA4335]" /> Rejected Submissions ({rejected.length})</p>
            <div className="space-y-2">
              {rejected.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div><p className="text-sm font-medium text-[#111B21]">{r.first_name} {r.surname}</p><p className="text-xs text-[#667781]">{r.ward}, {r.county}</p></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && dayRegs.length === 0 && (
        <Card><CardContent className="p-8 text-center text-sm text-[#667781]">No registrations on this date.</CardContent></Card>
      )}
    </div>
  );
}