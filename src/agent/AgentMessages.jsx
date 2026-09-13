import { useEffect, useRef, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Send, ArrowLeft } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth-role';
import { logAudit } from '@/lib/audit';

export default function AgentMessages() {
  const { user: me } = useCurrentUser();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  const load = async () => {
    try {
      const all = await supabaseApi.entities.Conversation.list('-last_message_at', 50);
      setConversations(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const open = async (c) => {
    setActive(c);
    setMessages([]);
    try {
      const msgs = await supabaseApi.entities.Message.filter({ conversation_id: c.id }, 'created_date', 200);
      setMessages(msgs);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  };

  const send = async () => {
    if (!text.trim() || !active) return;
    try {
      const m = await supabaseApi.entities.Message.create({ conversation_id: active.id, sender_id: me.id, body: text.trim() });
      await supabaseApi.entities.Conversation.update(active.id, { last_message: text.trim(), last_message_at: new Date().toISOString() });
      setMessages((ms) => [...ms, m]);
      setText('');
      await logAudit('message_sent', active.id);
      load();
    } catch {}
  };

  if (active) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="p-3 border-b border-slate-200 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setActive(null)}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <p className="text-sm font-semibold text-slate-900">{active.subject || 'Conversation'}</p>
            <p className="text-xs text-slate-500">Admin / Supervisor</p>
          </div>
        </div>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_id === me?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.sender_id === me?.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
                {m.body}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </CardContent>
        <div className="p-3 border-t border-slate-200 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message…" />
          <Button onClick={send} size="icon"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-bold text-slate-900">Messages</h1>
      {loading ? <p className="text-sm text-slate-400">Loading…</p> :
        conversations.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-sm text-slate-400">No conversations yet. An administrator will start one with you.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <Card key={c.id} className="border-slate-200 cursor-pointer" onClick={() => open(c)}>
                <CardContent className="p-3">
                  <p className="text-sm font-semibold text-slate-900 truncate">{c.subject || 'Conversation'}</p>
                  <p className="text-xs text-slate-500 truncate">{c.last_message || 'No messages yet'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}