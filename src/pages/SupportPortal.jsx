import { useState } from 'react';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { ArrowLeft, LifeBuoy, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/lib/auth-role';
import { useToast } from '@/ui/use-toast';
import { supabaseApi } from '@/api/supabaseApi';

export default function SupportPortal() {
  const navigate = useNavigate();
  const { user: me } = useCurrentUser();
  const { toast } = useToast();
  const [form, setForm] = useState({ subject: '', category: 'technical', priority: 'medium', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.subject.trim() || !form.description.trim()) { toast({ title: 'Please fill all fields', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      await supabaseApi.entities.Notification.create({
        recipient_id: 'admin',
        title: `Support: ${form.subject}`,
        message: `Category: ${form.category} | Priority: ${form.priority}\nFrom: ${me?.full_name || me?.email}\n\n${form.description}`,
        category: 'message',
      });
      toast({ title: '✅ Support request submitted', description: 'The admin team will get back to you soon.' });
      setForm({ subject: '', category: 'technical', priority: 'medium', description: '' });
    } catch { toast({ title: 'Could not submit request', variant: 'destructive' }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><LifeBuoy className="w-6 h-6 text-sky-600" /> Support Portal</h1>
        <p className="text-sm text-slate-500">Submit technical issues or help requests directly to the administrative team.</p>
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label className="text-xs">Subject *</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of the issue" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="account">Account Problem</SelectItem>
                  <SelectItem value="data">Data / Registration</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Description *</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail…" rows={5} />
          </div>
          <Button onClick={submit} disabled={submitting} className="w-full"><Send className="w-4 h-4 mr-2" /> {submitting ? 'Submitting…' : 'Submit Request'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}