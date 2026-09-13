import { useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Megaphone, Send } from 'lucide-react';
import { logAudit } from '@/lib/audit';
import { useToast } from '@/ui/use-toast';

export default function BroadcastNotices() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(null);

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: 'Title and message are required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const users = await supabaseApi.entities.User.list('-created_date', 200);
      const agents = users.filter((u) => u.role === 'field_agent');
      if (agents.length === 0) {
        toast({ title: 'No field agents to notify', variant: 'destructive' });
        setSending(false);
        return;
      }
      await supabaseApi.entities.Notification.bulkCreate(
        agents.map((a) => ({
          recipient_id: a.id,
          title: title.trim(),
          message: message.trim(),
          category: 'announcement',
          read: false,
        }))
      );
      await logAudit('broadcast_sent', '', `To ${agents.length} agents: ${title}`);
      setSentCount(agents.length);
      toast({ title: 'Broadcast sent', description: `${agents.length} agents notified.` });
      setTitle('');
      setMessage('');
    } catch (e) {
      toast({ title: 'Broadcast failed', description: e.message, variant: 'destructive' });
    } finally { setSending(false); }
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Broadcast Notices</h1>
        <p className="text-sm text-slate-500">Send an operational update or alert to all active field agents at once.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone className="w-4 h-4" />New Broadcast</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Schedule change for tomorrow" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Message</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your announcement…" rows={4} />
          </div>
          <Button onClick={send} disabled={sending}>
            <Send className="w-4 h-4 mr-2" />{sending ? 'Sending…' : 'Send to all agents'}
          </Button>
          {sentCount !== null && !sending && (
            <p className="text-sm text-green-600">Last broadcast reached {sentCount} agents.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}