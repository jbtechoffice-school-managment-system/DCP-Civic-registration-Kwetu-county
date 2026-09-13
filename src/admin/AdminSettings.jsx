import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { UserPlus, ShieldAlert } from 'lucide-react';
import { logAudit } from '@/lib/audit';
import { useToast } from '@/ui/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('field_agent');
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.User.list('-created_date', 200);
      setUsers(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const changeRole = async (u, role) => {
    await supabaseApi.entities.User.update(u.id, { role });
    await logAudit('permission_changed', u.id, `${u.email} role -> ${role}`);
    toast({ title: 'Role updated' });
    load();
  };

  const invite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await supabaseApi.users.inviteUser(inviteEmail.trim(), inviteRole);
      await logAudit('agent_created', '', `invited ${inviteEmail} as ${inviteRole}`);
      toast({ title: 'Invitation sent', description: `${inviteEmail} will receive a sign-up link.` });
      setInviteEmail('');
      load();
    } catch (e) {
      toast({ title: 'Could not invite user', description: e.message, variant: 'destructive' });
    } finally { setInviting(false); }
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-500">Manage users, roles, and permissions.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><UserPlus className="w-4 h-4" /> Invite User</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="agent@example.org" />
          </div>
          <div>
            <Label className="text-xs">Role</Label>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="field_agent">Field Agent</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={invite} disabled={inviting}>{inviting ? 'Sending…' : 'Send Invitation'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Users & Roles</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Current Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{u.full_name || u.email}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">{u.role}</span></td>
                  <td className="px-4 py-3">
                    {u.account_status === 'suspended' ? <ShieldAlert className="w-4 h-4 text-red-600" /> : <span className="text-green-600 text-xs">Active</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Select value={u.role} onValueChange={(v) => changeRole(u, v)}>
                      <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="field_agent">Field Agent</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}