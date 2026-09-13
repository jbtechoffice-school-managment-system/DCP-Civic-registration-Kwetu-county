import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '@/api/supabaseApi';
import { UserPlus, Users, MessageSquare, Activity, MapPin, Pause, Square, Play } from 'lucide-react';
import { queueLength } from '@/lib/offline';
import { logAudit } from '@/lib/audit';
import { useCurrentUser } from '@/lib/auth-role';

export default function AgentHome() {
  const navigate = useNavigate();
  const { user: me } = useCurrentUser();
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0, messages: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    (async () => {
      try {
        const [all, convs] = await Promise.all([
          supabaseApi.entities.Registration.filter({}, '-created_date', 200),
          supabaseApi.entities.Conversation.list('-last_message_at', 50),
        ]);
        const todayStr = new Date().toISOString().slice(0, 10);
        const today = all.filter((r) => (r.created_date || '').slice(0, 10) === todayStr);
        const verified = all.filter((r) => r.verification_status === 'verified');
        const flagged = all.filter((r) => r.verification_status === 'flagged');
        setStats({
          total: all.length,
          today: today.length,
          pending: all.length - verified.length - flagged.length,
          messages: convs.length,
        });
        setRecent(all.slice(0, 5));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const sessions = await supabaseApi.entities.LocationSession.filter({ status: { $in: ['active', 'paused'] } }, '-started_at', 1);
        setSession(sessions[0] || null);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!session) return;
    const t = setInterval(() => {
      const start = new Date(session.started_at).getTime();
      const diff = Date.now() - start;
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(t);
  }, [session]);

  const stopSession = async () => {
    if (!session) return;
    await supabaseApi.entities.LocationSession.update(session.id, { status: 'stopped', ended_at: new Date().toISOString() });
    await logAudit('location_session_stopped', session.id);
    setSession(null);
  };
  const pauseSession = async () => {
    if (!session) return;
    await supabaseApi.entities.LocationSession.update(session.id, { status: 'paused' });
    setSession({ ...session, status: 'paused' });
  };
  const resumeSession = async () => {
    if (!session) return;
    await supabaseApi.entities.LocationSession.update(session.id, { status: 'active' });
    setSession({ ...session, status: 'active' });
  };

  const statItems = [
    { label: 'Registered', value: stats.total, color: 'text-[#008F4C]' },
    { label: 'Today', value: stats.today, color: 'text-[#111B21]' },
    { label: 'Pending', value: stats.pending, color: 'text-[#111B21]' },
    { label: 'Messages', value: stats.messages, color: 'text-[#111B21]' },
  ];

  const actions = [
    { label: 'Register Resident', icon: UserPlus, to: '/app/new', primary: true },
    { label: 'People', icon: Users, to: '/app/registrations' },
    { label: 'Messages', icon: MessageSquare, to: '/app/messages' },
    { label: 'My Activity', icon: Activity, to: '/app/field-calendar' },
  ];

  return (
    <div className="p-4 space-y-5 select-none">
      {/* Welcome */}
      <div>
        <p className="text-sm text-[#667781]">Welcome back,</p>
        <h2 className="text-xl font-semibold text-[#111B21]">{me?.full_name || 'Agent'}</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {statItems.map((s) => (
          <div key={s.label} className="bg-[#F0F2F5] rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-[#667781] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active session banner */}
      {session && (
        <div className="bg-[#D9FDD3] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008F4C] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#008F4C]" />
            </span>
            <p className="text-sm font-semibold text-[#008F4C]">Field Location: {session.status === 'paused' ? 'PAUSED' : 'ACTIVE'}</p>
          </div>
          <p className="text-xs text-[#667781] font-mono mb-3">Elapsed {elapsed}</p>
          <div className="flex gap-2">
            {session.status === 'paused' ? (
              <button onClick={resumeSession} className="px-3 py-1.5 rounded-lg bg-white text-[#008F4C] text-xs font-medium border border-[#008F4C]">Resume</button>
            ) : (
              <button onClick={pauseSession} className="px-3 py-1.5 rounded-lg bg-white text-[#111B21] text-xs font-medium border border-[#E9EDEF] flex items-center gap-1"><Pause className="w-3 h-3" />Pause</button>
            )}
            <button onClick={stopSession} className="px-3 py-1.5 rounded-lg bg-[#EA4335] text-white text-xs font-medium flex items-center gap-1"><Square className="w-3 h-3" />Stop</button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-sm font-medium text-[#111B21] mb-3">Quick actions</p>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.to)}
              className={`flex flex-col items-center gap-2 rounded-xl p-4 active:opacity-80 ${a.primary ? 'bg-[#008F4C] text-white' : 'bg-[#F0F2F5] text-[#111B21]'}`}
            >
              <a.icon className={`w-6 h-6 ${a.primary ? 'text-white' : 'text-[#008F4C]'}`} />
              <span className="text-sm font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start session */}
      {!session && (
        <button onClick={() => navigate('/app/profile')} className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-[#E9EDEF] text-[#667781] text-sm font-medium active:bg-[#F0F2F5]">
          <MapPin className="w-4 h-4" /> Start Field Location Session
        </button>
      )}

      {/* Recent registrations */}
      <div>
        <p className="text-sm font-medium text-[#111B21] mb-3">Recent Registrations</p>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-[#F0F2F5] rounded-xl animate-pulse" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-[#667781] mx-auto mb-2 opacity-40" />
            <p className="text-sm text-[#667781]">No registrations yet</p>
            <p className="text-xs text-[#667781] mt-1">Residents you register will appear here.</p>
            <button onClick={() => navigate('/app/new')} className="mt-3 px-4 py-2 bg-[#008F4C] text-white rounded-lg text-sm font-medium">
              Register Resident
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-[#F0F2F5] rounded-xl cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#008F4C] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                  {r.first_name?.charAt(0)}{r.surname?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#111B21] truncate">{r.first_name} {r.surname}</p>
                  <p className="text-xs text-[#667781] truncate">{r.community}, {r.ward}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${r.verification_status === 'verified' ? 'bg-[#D9FDD3] text-[#008F4C]' : r.verification_status === 'flagged' ? 'bg-red-100 text-[#EA4335]' : 'bg-[#F0F2F5] text-[#667781]'}`}>
                  {r.verification_status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}