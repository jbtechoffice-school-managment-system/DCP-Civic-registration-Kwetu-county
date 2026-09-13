import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Switch } from '@/ui/switch';
import { AlertTriangle, Bell, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { logAudit } from '@/lib/audit';

const SEVERITY_STYLES = {
  critical: { cls: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  warning: { cls: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  info: { cls: 'bg-sky-100 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
};

export default function OperationalAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', severity: 'info' });

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.OperationalAlert.list('-created_date', 50);
      setAlerts(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast({ title: 'Title and message required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await supabaseApi.entities.OperationalAlert.create({
        title: form.title,
        message: form.message,
        severity: form.severity,
        active: true,
      });
      await logAudit('alert_created', '', `${form.severity}: ${form.title}`);
      toast({ title: 'Alert published to all agents' });
      setForm({ title: '', message: '', severity: 'info' });
      setShowForm(false);
      load();
    } catch (e) {
      toast({ title: 'Could not create alert', description: e.message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const toggleActive = async (a) => {
    await supabaseApi.entities.OperationalAlert.update(a.id, { active: !a.active });
    load();
  };

  const remove = async (a) => {
    await supabaseApi.entities.OperationalAlert.delete(a.id);
    await logAudit('alert_deleted', a.id, a.title);
    load();
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-600" />Operational Alerts</h1>
          <p className="text-sm text-slate-500">Push critical, time-sensitive warnings to all active field agents.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />New Alert
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Severe Weather Warning" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Message</label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Alert details for field agents…" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Severity</label>
              <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={create} disabled={submitting}>{submitting ? 'Publishing…' : 'Publish Alert'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : alerts.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No alerts published yet.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const style = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.info;
            return (
              <Card key={a.id} className={!a.active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900 text-sm">{a.title}</p>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${style.cls}`}>{a.severity}</span>
                        </div>
                        <p className="text-sm text-slate-600">{a.message}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{(a.created_date || '').slice(0, 16).replace('T', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Switch checked={a.active} onCheckedChange={() => toggleActive(a)} />
                        <span className="text-[11px] text-slate-500">{a.active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <button onClick={() => remove(a)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}