import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { UserPlus, Mail, Users } from 'lucide-react';
import { useToast } from '@/ui/use-toast';

export default function UserInvitations() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.User.list('-created_date', 200);
      setUsers(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const invite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    try {
      await supabaseApi.users.inviteUser(email.trim(), role);
      toast({ title: 'Invitation sent', description: `${email} has been invited as ${role}.` });
      setEmail('');
      load();
    } catch (e) {
      toast({ title: 'Invitation failed', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally { setInviting(false); }
  };

  const fieldAgents = users.filter((u) => u.role === 'field_agent');
  const admins = users.filter((u) => u.role === 'admin');

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] flex items-center gap-2"><UserPlus className="w-5 h-5 text-[#008F4C]" /> User Invitations</h1>
        <p className="text-sm text-[#667781]">Send, track, and manage access for field agents.</p>
      </div>

      {/* Invite form */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-[#111B21]">Invite New User</p>
          <div>
            <label className="text-xs text-[#667781] mb-1.5 block">Email Address</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@example.com" type="email" />
          </div>
          <div>
            <label className="text-xs text-[#667781] mb-1.5 block">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Field Agent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={invite} disabled={inviting || !email.trim()} className="w-full bg-[#008F4C] text-white">
            <Mail className="w-4 h-4 mr-2" /> {inviting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </CardContent>
      </Card>

      {/* User counts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F0F2F5] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#008F4C]">{fieldAgents.length}</p>
          <p className="text-xs text-[#667781] mt-0.5">Field Agents</p>
        </div>
        <div className="bg-[#F0F2F5] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#111B21]">{admins.length}</p>
          <p className="text-xs text-[#667781] mt-0.5">Admins</p>
        </div>
      </div>

      {/* User list */}
      <div>
        <p className="text-sm font-medium text-[#111B21] mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-[#667781]" /> All Users</p>
        {loading ? <p className="text-sm text-[#667781]">Loading...</p> : (
          <div className="space-y-2">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${u.role === 'admin' ? 'bg-[#008F4C] text-white' : 'bg-[#F0F2F5] text-[#667781]'}`}>
                    {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#111B21] truncate">{u.full_name || u.email}</p>
                    <p className="text-xs text-[#667781] truncate">{u.email}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full shrink-0 ${u.role === 'admin' ? 'bg-[#D9FDD3] text-[#008F4C]' : 'bg-[#F0F2F5] text-[#667781]'}`}>{u.role}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}