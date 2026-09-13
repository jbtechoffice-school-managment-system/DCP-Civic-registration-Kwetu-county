import { useEffect, useRef, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Search, Send } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth-role';
import { logAudit } from '@/lib/audit';

export default function AdminMessages() {
  const { user: me } = useCurrentUser();
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [activeAgent, setActiveAgent] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const users = await supabaseApi.entities.User.list('-created_date', 200);
        setAgents(users.filter((u) => u.role === 'field_agent'));
      } catch {}
    })();
  }, []);

  const openConversation = async (agent) => {
    setActiveAgent(agent);
    setMessages([]);
    setConversation(null);
    try {
      const existing = await supabaseApi.entities.Conversation.filter({ members: agent.id }, '-last_message_at', 50);
      let conv = existing.find((c) => c.members?.includes(me?.id) && c.members?.includes(agent.id));
      if (!conv) {
        conv = await supabaseApi.entities.Conversation.create({ members: [me.id, agent.id], subject: `${me.full_name} ↔ ${agent.full_name}` });
      }
      setConversation(conv);
      const msgs = await supabaseApi.entities.Message.filter({ conversation_id: conv.id }, 'created_date', 200);
      setMessages(msgs);
    } catch {}
  };

  const send = async () => {
    if (!text.trim() || !conversation) return;
    try {
      const m = await supabaseApi.entities.Message.create({ conversation_id: conversation.id, sender_id: me.id, body: text.trim() });
      await supabaseApi.entities.Conversation.update(conversation.id, { last_message: text.trim(), last_message_at: new Date().toISOString() });
      setMessages((ms) => [...ms, m]);
      setText('');
      await logAudit('message_sent', conversation.id, `to ${activeAgent?.email}`);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  };

  const filtered = agents.filter((a) => `${a.full_name} ${a.email} ${a.operating_area}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-sm text-slate-500">Secure conversations with individual field agents.</p>
      </div>
      <div className="grid grid-cols-3 gap-4 h-[560px]">
        <Card className="overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200 relative">
            <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agents…" className="pl-8" />
          </div>
          <CardContent className="p-0 flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((a) => (
              <button key={a.id} onClick={() => openConversation(a)} className={`w-full text-left p-3 hover:bg-slate-50 ${activeAgent?.id === a.id ? 'bg-slate-100' : ''}`}>
                <p className="text-sm font-medium text-slate-900">{a.full_name || a.email}</p>
                <p className="text-xs text-slate-500">{a.operating_area || '—'}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-2 flex flex-col">
          {activeAgent ? (
            <>
              <div className="p-3 border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-900">{activeAgent.full_name}</p>
                <p className="text-xs text-slate-500">{activeAgent.email}</p>
              </div>
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === me?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${m.sender_id === me?.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
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
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center text-sm text-slate-400">Select an agent to start a conversation.</CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}