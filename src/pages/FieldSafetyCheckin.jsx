import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Textarea } from '@/ui/textarea';
import { Shield, ArrowLeft, CheckCircle2, AlertCircle, Siren } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/lib/auth-role';
import { useToast } from '@/ui/use-toast';

const STATUSES = [
  { value: 'safe', label: 'I\'m Safe', icon: CheckCircle2, color: 'bg-[#008F4C] text-white', desc: 'Confirm you are safe and well.' },
  { value: 'need_support', label: 'Need Support', icon: AlertCircle, color: 'bg-[#F7C948] text-[#111B21]', desc: 'Request assistance from your supervisor.' },
  { value: 'emergency', label: 'Emergency', icon: Siren, color: 'bg-[#EA4335] text-white', desc: 'Send an urgent emergency alert.' },
];

export default function FieldSafetyCheckin() {
  const { user: me } = useCurrentUser();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.SafetyCheckin.list('-created_date', 50);
      setCheckins(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const checkin = async (status) => {
    setSubmitting(true);
    try {
      let lat = null, lng = null;
      try {
        const pos = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('no geo'));
          navigator.geolocation.getCurrentPosition((p) => resolve(p), () => resolve(null), { timeout: 5000 });
        });
        if (pos) { lat = pos.coords.latitude; lng = pos.coords.longitude; }
      } catch {}
      await supabaseApi.entities.SafetyCheckin.create({
        agent_id: me.id, agent_name: me.full_name || me.email,
        status, location, notes, lat, lng,
      });
      toast({ title: 'Check-in submitted', description: 'Your status has been shared with the admin team.' });
      setNotes(''); setLocation('');
      load();
    } catch { toast({ title: 'Check-in failed', variant: 'destructive' }); }
    finally { setSubmitting(false); }
  };

  const STATUS_CLS = { safe: 'bg-[#D9FDD3] text-[#008F4C]', need_support: 'bg-[#FFF8E1] text-[#F7C948]', emergency: 'bg-red-100 text-[#EA4335]' };

  return (
    <div className="p-4 space-y-4 select-none">
      <div className="flex items-center gap-2">
        <Link to="/app" className="p-1.5 hover:bg-[#F0F2F5] rounded-full"><ArrowLeft className="w-5 h-5 text-[#111B21]" /></Link>
        <h1 className="text-lg font-bold text-[#111B21] flex items-center gap-2"><Shield className="w-5 h-5 text-[#008F4C]" /> Safety Check-in</h1>
      </div>

      <Card className="bg-[#D9FDD3] border-[#008F4C]/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-[#008F4C]">Your safety matters</p>
          <p className="text-xs text-[#667781] mt-1">Quickly confirm your status or request immediate support during field work.</p>
        </CardContent>
      </Card>

      {/* Status buttons */}
      <div className="space-y-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => checkin(s.value)}
            disabled={submitting}
            className={`w-full flex items-center gap-3 p-4 rounded-xl active:opacity-80 disabled:opacity-50 ${s.color}`}
          >
            <s.icon className="w-6 h-6 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="text-xs opacity-80">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Optional info */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <label className="text-xs text-[#667781] mb-1.5 block">Location (optional)</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where are you now?" className="w-full h-11 px-3 rounded-lg border border-[#E9EDEF] text-sm focus:outline-none focus:ring-1 focus:ring-[#008F4C]" />
          </div>
          <div>
            <label className="text-xs text-[#667781] mb-1.5 block">Notes (optional)</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional information..." rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Recent check-ins */}
      <div>
        <p className="text-sm font-medium text-[#111B21] mb-2">Recent Check-ins</p>
        {loading ? <p className="text-sm text-[#667781]">Loading...</p> : checkins.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-sm text-[#667781]">No check-ins yet.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {checkins.slice(0, 10).map((c) => (
              <Card key={c.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#111B21]">{c.agent_name}</p>
                    {c.location && <p className="text-xs text-[#667781]">{c.location}</p>}
                    {c.notes && <p className="text-xs text-[#667781] mt-0.5">{c.notes}</p>}
                    <p className="text-[11px] text-[#667781] mt-0.5">{(c.created_date || '').slice(0, 16).replace('T', ' ')}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full shrink-0 ${STATUS_CLS[c.status] || ''}`}>{c.status}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}