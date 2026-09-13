import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '@/api/supabaseApi';
import { Input } from '@/ui/input';
import { MapPin, Play, Square, LogOut, Lock, Bell, HelpCircle, Info, ChevronRight, Trash2, GraduationCap, Newspaper, Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCurrentUser } from '@/lib/auth-role';
import { logAudit } from '@/lib/audit';
import { useToast } from '@/ui/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/ui/alert-dialog';

export default function AgentProfile() {
  const { user, logout } = useAuth();
  const { user: me } = useCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const sessions = await supabaseApi.entities.LocationSession.filter({ status: { $in: ['active', 'paused'] } }, '-started_at', 1);
        setSession(sessions[0] || null);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (me) setProfile({ full_name: me.full_name || '', phone: me.phone || '', agent_reference: me.agent_reference || '', operating_area: me.operating_area || '' });
  }, [me]);

  const startSession = async () => {
    try {
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('no geo'));
        navigator.geolocation.getCurrentPosition((p) => resolve(p), () => resolve(null), { enableHighAccuracy: false, timeout: 8000 });
      });
      const s = await supabaseApi.entities.LocationSession.create({
        agent_id: me.id, status: 'active', started_at: new Date().toISOString(),
        last_lat: pos ? pos.coords.latitude : null, last_lng: pos ? pos.coords.longitude : null,
        last_update_at: new Date().toISOString(), ward: me.operating_area || '',
      });
      setSession(s);
      await logAudit('location_session_started', s.id);
      toast({ title: 'Field location sharing is ACTIVE' });
    } catch { toast({ title: 'Could not start session', variant: 'destructive' }); }
  };

  const stopSession = async () => {
    if (!session) return;
    await supabaseApi.entities.LocationSession.update(session.id, { status: 'stopped', ended_at: new Date().toISOString() });
    await logAudit('location_session_stopped', session.id);
    setSession(null);
    toast({ title: 'Field location sharing stopped' });
  };

  const doLogout = () => { logout(false); navigate('/login', { replace: true }); };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await logAudit('account_deletion_requested');
      toast({ title: 'Deletion requested', description: 'An administrator will process your request.' });
      setDeleteOpen(false); setDeleteConfirm('');
      setTimeout(() => { logout(false); navigate('/login', { replace: true }); }, 1500);
    } catch { toast({ title: 'Could not submit request', variant: 'destructive' }); }
    finally { setDeleting(false); }
  };

  if (!profile) return <div className="p-4 text-sm text-[#667781]">Loading…</div>;

  const menuItems = [
    { icon: Bell, label: 'Notifications', action: () => navigate('/app/notifications') },
    { icon: GraduationCap, label: 'Training Hub', action: () => navigate('/training-hub') },
    { icon: Newspaper, label: 'Community Updates', action: () => navigate('/community-updates') },
    { icon: Shield, label: 'Safety Check-in', action: () => navigate('/safety-checkin') },
    { icon: Lock, label: 'Privacy', action: () => navigate('/forgot-password') },
    { icon: HelpCircle, label: 'Help', action: () => navigate('/help') },
  ];

  return (
    <div className="pb-20 select-none">
      {/* Profile header */}
      <div className="bg-white px-4 py-6 flex flex-col items-center border-b border-[#E9EDEF]">
        <div className="w-20 h-20 rounded-full bg-[#008F4C] text-white flex items-center justify-center text-2xl font-semibold mb-3">
          {(profile.full_name || user?.email || 'A').charAt(0).toUpperCase()}
        </div>
        <h2 className="text-lg font-semibold text-[#111B21]">{profile.full_name || 'Agent'}</h2>
        <p className="text-sm text-[#667781]">Oversight Mobilizer</p>
        <p className="text-xs text-[#667781] mt-1">{user?.email}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Field session */}
        <div className="bg-white rounded-xl p-4 border border-[#E9EDEF]">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#008F4C]" />
            <p className="text-sm font-medium text-[#111B21]">Field Location Sharing</p>
          </div>
          <p className="text-xs text-[#667781] mb-3">
            {session ? `Session active since ${new Date(session.started_at).toLocaleTimeString()}.` : 'Location sharing is OFF. Start a session to share your location during field work.'}
          </p>
          {session ? (
            <button onClick={stopSession} className="w-full h-11 rounded-xl bg-[#EA4335] text-white text-sm font-medium active:opacity-80 flex items-center justify-center gap-2">
              <Square className="w-4 h-4" /> Stop Session
            </button>
          ) : (
            <button onClick={startSession} className="w-full h-11 rounded-xl bg-[#008F4C] text-white text-sm font-medium active:opacity-80 flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Start Session
            </button>
          )}
        </div>

        {/* Profile info */}
        <div className="bg-white rounded-xl border border-[#E9EDEF] divide-y divide-[#E9EDEF]">
          {[
            { label: 'Phone', value: profile.phone || '—' },
            { label: 'Agent Reference', value: profile.agent_reference || '—' },
            { label: 'Operating Area', value: profile.operating_area || '—' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4">
              <span className="text-sm text-[#667781]">{item.label}</span>
              <span className="text-sm font-medium text-[#111B21]">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-xl border border-[#E9EDEF] divide-y divide-[#E9EDEF]">
          {menuItems.map((item) => (
            <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 p-4 active:bg-[#F0F2F5]">
              <item.icon className="w-5 h-5 text-[#667781]" />
              <span className="text-sm text-[#111B21] flex-1 text-left">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-[#667781]" />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button onClick={doLogout} className="w-full h-12 rounded-xl bg-[#F0F2F5] text-[#EA4335] text-sm font-medium active:opacity-80 flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Log out
          </button>
          <button onClick={() => setDeleteOpen(true)} className="w-full h-12 rounded-xl border border-[#EA4335] text-[#EA4335] text-sm font-medium active:opacity-80 flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent. Type <strong>DELETE</strong> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="Type DELETE" className="mt-2" />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || deleting} className="bg-[#EA4335] text-white">
              {deleting ? 'Processing...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}