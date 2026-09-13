import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs';
import { logAudit } from '@/lib/audit';
import { useToast } from '@/ui/use-toast';

export default function AdminNotifications() {
  const { toast } = useToast();
  const [agents, setAgents] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('announcement');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const users = await supabaseApi.entities.User.list('-created_date', 200);
        setAgents(users.filter((u) => u.role === 'field_agent'));
        const all = await supabaseApi.entities.Notification.list('-created_date', 50);
        setSent(all);
      } catch {}
    })();
  }, []);

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: 'Title and message are required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      // broadcast to all active field agents
      const targets = agents.filter((a) => a.account_status !== 'suspended');
      await supabaseApi.entities.Notification.bulkCreate(
        targets.map((a) => ({ recipient_id: a.id, title: title.trim(), message: body.trim(), category }))
      );
      await logAudit('announcement_sent', '', `to ${targets.length} agents: ${title}`);
      toast({ title: `Announcement sent to ${targets.length} agents` });
      setTitle(''); setBody('');
      const all = await supabaseApi.entities.Notification.list('-created_date', 50);
      setSent(all);
    } catch (e) {
      toast({ title: 'Could not send announcement', variant: 'destructive' });
    } finally { setSending(false); }
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-500">Broadcast authorized announcements to field agents.</p>
      </div>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="compose">
          <Card className="max-w-xl">
            <CardHeader><CardTitle className="text-sm">New Announcement</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Message</Label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
              </div>
              <p className="text-xs text-slate-500">This announcement will be delivered to {agents.filter((a) => a.account_status !== 'suspended').length} active agents.</p>
              <Button onClick={send} disabled={sending}>{sending ? 'Sending…' : 'Send Announcement'}</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardContent className="p-0 divide-y divide-slate-100">
              {sent.length === 0 ? <p className="p-6 text-sm text-slate-400 text-center">No notifications sent.</p> :
                sent.map((n) => (
                  <div key={n.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{n.title}</p>
                      <span className="text-[11px] text-slate-400">{n.created_date}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{n.category}</span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}