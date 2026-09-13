import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Label } from '@/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Bell, Plus, Trash2, Send } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotificationTemplates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', category: 'announcement' });

  const load = async () => {
    try {
      const notifs = await supabaseApi.entities.Notification.list('-created_date', 200);
      // Use past notifications as templates
      setTemplates(notifs.filter((n) => n.category === 'announcement').slice(0, 20));
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    try {
      await supabaseApi.entities.Notification.create({ recipient_id: 'template', ...form });
      toast({ title: 'Template saved' });
      setShowForm(false);
      setForm({ title: '', message: '', category: 'announcement' });
      load();
    } catch { toast({ title: 'Could not save template', variant: 'destructive' }); }
  };

  const loadTemplate = (t) => {
    setForm({ title: t.title, message: t.message, category: t.category || 'announcement' });
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Bell className="w-6 h-6 text-sky-600" /> Notification Templates</h1>
          <p className="text-sm text-slate-500">Define and save reusable notification and broadcast templates.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-3.5 h-3.5 mr-1" /> New Template</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="announcement">Announcement</SelectItem><SelectItem value="system">System</SelectItem><SelectItem value="account">Account</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} /></div>
            <Button size="sm" onClick={save}><Send className="w-3.5 h-3.5 mr-1" /> Save Template</Button>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-slate-400">No templates yet. Create one to get started.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{t.message}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => loadTemplate(t)}>Use</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}