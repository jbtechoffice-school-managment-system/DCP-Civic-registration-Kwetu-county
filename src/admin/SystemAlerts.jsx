import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Siren, Plus, X } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { logAudit } from '@/lib/audit';

const SEV_CLS = { info: 'bg-blue-100 text-blue-700', warning: 'bg-amber-100 text-amber-700', critical: 'bg-red-100 text-red-700' };

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', severity: 'info', expires_at: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.OperationalAlert.list('-created_date', 100);
      setAlerts(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    try {
      await supabaseApi.entities.OperationalAlert.create({
        title: form.title,
        message: form.message,
        severity: form.severity,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      });
      await logAudit('system_alert_created');
      toast({ title: 'Alert created' });
      setDialogOpen(false);
      setForm({ title: '', message: '', severity: 'info', expires_at: '' });
      load();
    } catch { toast({ title: 'Failed to create alert', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const deactivate = async (a) => {
    await supabaseApi.entities.OperationalAlert.update(a.id, { active: false });
    load();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Siren className="w-5 h-5 text-red-500" /> System Alerts
          </h1>
          <p className="text-sm text-slate-500">Create and monitor broadcast notifications for the agent mobile home screen.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Alert</Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Loading…</p>
      ) : alerts.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-sm text-slate-400">No alerts created yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <Card key={a.id} className={a.active ? '' : 'opacity-60'}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${SEV_CLS[a.severity] || ''}`}>{a.severity}</span>
                      {a.active && <span className="text-[11px] text-green-600 font-medium">● Active</span>}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{a.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{a.message}</p>
                    {a.expires_at && <p className="text-[11px] text-slate-400 mt-1">Expires: {new Date(a.expires_at).toLocaleString()}</p>}
                  </div>
                  {a.active && (
                    <Button variant="ghost" size="icon" onClick={() => deactivate(a)} className="shrink-0">
                      <X className="w-4 h-4 text-slate-400" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create System Alert</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Alert title" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Message</label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Alert message shown to agents" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">Severity</label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Expires (optional)</label>
                <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={create} disabled={saving || !form.title.trim() || !form.message.trim()}>{saving ? 'Creating…' : 'Create Alert'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}