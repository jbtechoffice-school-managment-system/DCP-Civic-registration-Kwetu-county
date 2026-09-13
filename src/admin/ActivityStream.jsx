import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { UserPlus, FileText, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityStream() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [regs, users, audits, alerts] = await Promise.all([
          supabaseApi.entities.Registration.list('-created_date', 30),
          supabaseApi.entities.User.list('-created_date', 10),
          supabaseApi.entities.AuditLog.list('-created_date', 20),
          supabaseApi.entities.OperationalAlert.list('-created_date', 5),
        ]);

        const items = [];
        regs.forEach((r) => {
          items.push({
            id: `reg-${r.id}`, type: 'registration', time: r.created_date,
            title: `New registration: ${r.first_name} ${r.surname}`,
            desc: `${r.ward}, ${r.county}`,
            icon: FileText, color: 'text-sky-600', bg: 'bg-sky-50',
          });
        });
        users.filter((u) => u.role === 'field_agent').forEach((u) => {
          items.push({
            id: `user-${u.id}`, type: 'signup', time: u.created_date,
            title: `New agent joined: ${u.full_name || u.email}`,
            desc: 'Field agent account created',
            icon: UserPlus, color: 'text-green-600', bg: 'bg-green-50',
          });
        });
        audits.forEach((a) => {
          items.push({
            id: `audit-${a.id}`, type: 'audit', time: a.created_date,
            title: (a.action || '').replace(/_/g, ' '),
            desc: a.details || a.actor_email || '',
            icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50',
          });
        });
        alerts.forEach((a) => {
          items.push({
            id: `alert-${a.id}`, type: 'alert', time: a.created_date,
            title: `Alert: ${a.title}`,
            desc: a.message,
            icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50',
          });
        });

        items.sort((a, b) => new Date(b.time) - new Date(a.time));
        setFeed(items.slice(0, 50));
      } catch {} finally { setLoading(false); }
    })();

    const unsub = supabaseApi.entities.Registration.subscribe(() => {
      // refresh on new registration
    });
    return unsub;
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2"><Activity className="w-5 h-5 text-sky-600" />Activity Stream</h1>
        <p className="text-sm text-slate-500">Real-time feed of registrations, agent signups, and system alerts.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : feed.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-slate-400">No recent activity.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {feed.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-3 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 capitalize">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(item.time)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}