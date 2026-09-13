import { useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { COUNTIES, constituenciesFor, wardsFor } from '@/lib/geo';

export default function AgentOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', county: '', constituency: '', ward: '', role: 'field_agent' });
  const [submitting, setSubmitting] = useState(false);

  const generateRef = () => 'AGT-' + Date.now().toString().slice(-6);

  const submit = async () => {
    if (!form.email.trim() || !form.full_name.trim()) { toast({ title: 'Email and name are required', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      await supabaseApi.users.inviteUser(form.email.trim(), form.role);
      toast({ title: '✅ Agent invited successfully', description: `${form.email} has been invited as ${form.role}. Reference: ${generateRef()}` });
      setForm({ email: '', full_name: '', phone: '', county: '', constituency: '', ward: '', role: 'field_agent' });
    } catch (e) { toast({ title: 'Could not invite agent', description: e.message, variant: 'destructive' }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><UserPlus className="w-6 h-6 text-sky-600" /> Agent Onboarding</h1>
        <p className="text-sm text-slate-500">Create new agent accounts and assign them to specific constituencies or wards.</p>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">New Agent Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Full name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label className="text-xs">Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="field_agent">Field Agent</SelectItem><SelectItem value="supervisor">Supervisor</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Assigned County</Label>
            <Select value={form.county} onValueChange={(v) => setForm({ ...form, county: v, constituency: '', ward: '' })}>
              <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
              <SelectContent>{COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Constituency</Label>
              <Select value={form.constituency} onValueChange={(v) => setForm({ ...form, constituency: v, ward: '' })} disabled={!form.county}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{constituenciesFor(form.county).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Ward</Label>
              <Select value={form.ward} onValueChange={(v) => setForm({ ...form, ward: v })} disabled={!form.constituency}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{wardsFor(form.county, form.constituency).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-lg bg-sky-50 border border-sky-200 p-3">
            <p className="text-xs text-sky-800">Agent reference will be auto-generated: <span className="font-mono font-bold">{generateRef()}</span></p>
          </div>
          <Button onClick={submit} disabled={submitting} className="w-full">{submitting ? 'Inviting…' : 'Invite Agent'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}