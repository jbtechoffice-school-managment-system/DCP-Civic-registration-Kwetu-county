import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { FileText, CheckCircle2, Clock, MapPin, CalendarDays } from 'lucide-react';

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function RegistrationSummary() {
  const [regs, setRegs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r, s] = await Promise.all([
          supabaseApi.entities.Registration.list('-created_date', 1000),
          supabaseApi.entities.LocationSession.filter({ status: { $in: ['active', 'paused'] } }, '-last_update_at', 100),
        ]);
        setRegs(r);
        setSessions(s);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const todayCount = regs.filter((r) => isToday(r.created_date)).length;
  const verified = regs.filter((r) => r.verification_status === 'verified').length;
  const pending = regs.filter((r) => r.verification_status === 'unverified').length;

  const stats = [
    { label: 'Total Registrations', value: regs.length, icon: FileText, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: "Today's Registrations", value: todayCount, icon: CalendarDays, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Verified', value: verified, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Review', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Field Sessions', value: sessions.length, icon: MapPin, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registration Summary</h1>
        <p className="text-sm text-slate-500">Key statistics at a glance.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}