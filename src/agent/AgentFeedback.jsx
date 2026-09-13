import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { MessageSquarePlus, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { useCurrentUser } from '@/lib/auth-role';

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'challenge', label: 'Operational Challenge' },
  { value: 'other', label: 'Other' },
];

export default function AgentFeedback() {
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: 'suggestion', subject: '', message: '' });

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Feedback.list('-created_date', 50);
      setList(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      toast({ title: 'Please fill in subject and message', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await supabaseApi.entities.Feedback.create({
        agent_id: user?.id,
        agent_name: user?.full_name || user?.email,
        category: form.category,
        subject: form.subject,
        message: form.message,
      });
      toast({ title: 'Feedback submitted. Thank you!' });
      setForm({ category: 'suggestion', subject: '', message: '' });
      load();
    } catch (e) {
      toast({ title: 'Could not submit feedback', description: e.message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const statusBadge = (s) => {
    if (s === 'resolved') return { icon: CheckCircle2, cls: 'bg-green-100 text-green-700' };
    if (s === 'reviewing') return { icon: Clock, cls: 'bg-amber-100 text-amber-700' };
    return { icon: Clock, cls: 'bg-slate-100 text-slate-600' };
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><MessageSquarePlus className="w-5 h-5 text-sky-600" />Feedback Portal</h1>
        <p className="text-sm text-slate-500">Report challenges or suggest improvements to the registration process.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Category</label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Subject</label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief summary" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Message</label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe the issue or suggestion in detail…" rows={4} />
          </div>
          <Button onClick={submit} disabled={submitting} className="w-full">
            {submitting ? 'Submitting…' : 'Submit Feedback'}
          </Button>
        </CardContent>
      </Card>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Your Previous Feedback</p>
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-slate-400">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {list.map((f) => {
              const badge = statusBadge(f.status);
              return (
                <Card key={f.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-900">{f.subject}</p>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.cls}`}>
                        <badge.icon className="w-3 h-3" />{f.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{f.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{(f.created_date || '').slice(0, 10)} · {f.category}</p>
                    {f.admin_response && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-md">
                        <p className="text-[11px] font-medium text-slate-500">Admin Response:</p>
                        <p className="text-xs text-slate-700">{f.admin_response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}