import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';

export default function RegistrationStatusHistory() {
  const navigate = useNavigate();
  const [regs, setRegs] = useState([]);
  const [selected, setSelected] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [r, a] = await Promise.all([
          supabaseApi.entities.Registration.list('-created_date', 500),
          supabaseApi.entities.AuditLog.list('-created_date', 500),
        ]);
        setRegs(r);
        setLogs(a);
      } catch {}
    })();
  }, []);

  const regLogs = selected ? logs.filter((l) => l.record_id === selected) : [];
  const reg = regs.find((r) => r.id === selected);

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registration Status History</h1>
        <p className="text-sm text-slate-500">Chronological log of all status changes, edits, or flags applied to a specific registration.</p>
      </div>

      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger><SelectValue placeholder="Select a registration to view its history" /></SelectTrigger>
        <SelectContent>
          {regs.slice(0, 100).map((r) => <SelectItem key={r.id} value={r.id}>{r.first_name} {r.surname} — {r.ward}</SelectItem>)}
        </SelectContent>
      </Select>

      {selected && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {reg ? `${reg.first_name} ${reg.surname} — ${reg.ward}, ${reg.county}` : 'Registration'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regLogs.length === 0 ? (
              <p className="text-sm text-slate-400">No status changes recorded for this registration.</p>
            ) : (
              <div className="space-y-3">
                {regLogs.map((l, i) => (
                  <div key={l.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-sky-500' : 'bg-slate-300'}`} />
                      {i < regLogs.length - 1 && <div className="w-0.5 h-8 bg-slate-200" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-slate-900">{l.action}</p>
                      <p className="text-xs text-slate-500">{l.details || '—'}</p>
                      <p className="text-[10px] text-slate-400">{l.actor_email} · {l.created_date?.slice(0, 19).replace('T', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}