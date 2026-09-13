import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Megaphone, Send } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { logAudit } from '@/lib/audit';

export default function BroadcastMessages() {
  const [agents, setAgents] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const { toast } = useToast();

  const load = async () => {
    try {
      const [users, notifs] = await Promise.all([
        supabaseApi.entities.User.list('-created_date', 200),
        supabaseApi.entities.Notification.list('-created_date', 50),
      ]);
      setAgents(users.filter((u) => u.role === 'field_agent'));
      setHistory(notifs.filter((n) => n.category === 'announcement'));
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await Promise.all(
        agents.map((a) =>
          supabaseApi.entities.Notification.create({
            recipient_id: a.id, title: title.trim(), message: message.trim(),
            category: 'announcement', read: false,
          })
        )
      );
      await logAudit('broadcast_sent', '', `${title} → ${agents.length} agents`);
      toast({ title: 'Broadcast sent', description: `Message delivered to ${agents.length} field agents.` });
      setTitle(''); setMessage('');
      load();
    } catch { toast({ title: 'Broadcast failed', variant: 'destructive' }); }
    finally { setSending(false); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] flex items-center gap-2"><Megaphone className="w-5 h-5 text-[#008F4C]" /> Broadcast Messages</h1>
        <p className="text-sm text-[#667781]">Send announcements to all field agents at once.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-[#667781]">
            <span className="bg-[#D9FDD3] text-[#008F4C] px-2 py-1 rounded-full text-xs font-medium">{agents.length} agents</span>
            <span>will receive this message</span>
          </div>
          <div>
            <label className="text-xs text-[#667781] mb-1.5 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
          </div>
          <div>
            <label className="text-xs text-[#667781] mb-1.5 block">Message</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your broadcast message..." rows={4} />
          </div>
          <Button onClick={send} disabled={sending || !title.trim() || !message.trim()} className="w-full bg-[#008F4C] text-white">
            <Send className="w-4 h-4 mr-2" /> {sending ? 'Sending...' : `Send to ${agents.length} Agents`}
          </Button>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[#111B21] mb-3">Recent Broadcasts</p>
          <div className="space-y-2">
            {history.slice(0, 10).map((n) => (
              <Card key={n.id}>
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-[#111B21]">{n.title}</p>
                  <p className="text-xs text-[#667781] mt-0.5">{n.message}</p>
                  <p className="text-[11px] text-[#667781] mt-1">{(n.created_date || '').slice(0, 16).replace('T', ' ')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}