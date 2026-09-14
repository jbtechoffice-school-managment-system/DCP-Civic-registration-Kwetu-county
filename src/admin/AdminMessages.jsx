import { useEffect, useRef, useState } from 'react';
import { supabase, supabaseApi } from '@/api/supabaseApi';
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
  const [error, setError] = useState('');
  const [loadingConversation, setLoadingConversation] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!me?.id) return;

    let alive = true;

    (async () => {
      try {
        const users = await supabaseApi.entities.User.list('-created_date', 200);

        if (alive) {
          setAgents(
            users.filter(
              (u) =>
                u.role === 'field_agent' &&
                u.id !== me.id &&
                u.account_status !== 'disabled'
            )
          );
        }
      } catch (err) {
        console.error('Could not load field agents:', err);
        if (alive) {
          setError(err.message || 'Could not load field agents.');
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [me?.id]);

  const openConversation = async (agent) => {
    if (!me?.id || !agent?.id) return;

    setActiveAgent(agent);
    setMessages([]);
    setConversation(null);
    setError('');
    setLoadingConversation(true);

    try {
      /*
       * Find conversations in which the selected agent is a member.
       * Admins can read conversations through the conversations RLS policy.
       */
      const { data: agentMemberships, error: membershipError } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', agent.id);

      if (membershipError) throw membershipError;

      const conversationIds = (agentMemberships || []).map(
        (row) => row.conversation_id
      );

      let conv = null;

      if (conversationIds.length > 0) {
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .in('id', conversationIds)
          .order('last_message_at', { ascending: false, nullsFirst: false });

        if (conversationsError) throw conversationsError;

        /*
         * Only use a conversation where the current admin is also
         * a member. This keeps the conversation explicitly one-to-one.
         */
        for (const candidate of conversations || []) {
          const { data: myMembership, error: myMembershipError } = await supabase
            .from('conversation_members')
            .select('id')
            .eq('conversation_id', candidate.id)
            .eq('user_id', me.id)
            .maybeSingle();

          if (myMembershipError) throw myMembershipError;

          if (myMembership) {
            conv = candidate;
            break;
          }
        }
      }

      /*
       * No existing admin ? agent conversation.
       * Create the conversation, then add both participants.
       */
      if (!conv) {
        const subject = `${me.full_name || me.email || 'Administrator'} ? ${
          agent.full_name || agent.email || 'Field Agent'
        }`;

        conv = await supabaseApi.entities.Conversation.create({
          subject,
        });

        const { error: membersError } = await supabase
          .from('conversation_members')
          .insert([
            {
              conversation_id: conv.id,
              user_id: me.id,
            },
            {
              conversation_id: conv.id,
              user_id: agent.id,
            },
          ]);

        if (membersError) {
          /*
           * If membership creation fails, remove the empty conversation
           * so we don't leave an unusable orphan record.
           */
          try {
            await supabaseApi.entities.Conversation.delete(conv.id);
          } catch {}

          throw membersError;
        }
      }

      setConversation(conv);

      const msgs = await supabaseApi.entities.Message.filter(
        { conversation_id: conv.id },
        'created_date',
        200
      );

      setMessages(msgs);
    } catch (err) {
      console.error('Could not open conversation:', err);
      setError(err.message || 'Could not open conversation.');
      setConversation(null);
    } finally {
      setLoadingConversation(false);
    }
  };

  const send = async () => {
    if (!text.trim() || !conversation || !me?.id) return;

    const body = text.trim();
    setError('');

    try {
      const m = await supabaseApi.entities.Message.create({
        conversation_id: conversation.id,
        sender_id: me.id,
        body,
      });

      await supabaseApi.entities.Conversation.update(conversation.id, {
        last_message: body,
        last_message_at: new Date().toISOString(),
      });

      setMessages((ms) => [...ms, m]);
      setText('');

      await logAudit(
        'message_sent',
        conversation.id,
        `to ${activeAgent?.email || activeAgent?.id || 'field agent'}`
      );

      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Could not send message:', err);
      setError(err.message || 'Could not send message.');
    }
  };

  const filtered = agents.filter((a) =>
    `${a.full_name || ''} ${a.email || ''} ${a.operating_area || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-sm text-slate-500">
          Secure conversations with individual field agents.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 h-[560px]">
        <Card className="overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200 relative">
            <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents..."
              className="pl-8"
            />
          </div>

          <CardContent className="p-0 flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => openConversation(a)}
                className={`w-full text-left p-3 hover:bg-slate-50 ${
                  activeAgent?.id === a.id ? 'bg-slate-100' : ''
                }`}
              >
                <p className="text-sm font-medium text-slate-900">
                  {a.full_name || a.email || 'Field Agent'}
                </p>
                <p className="text-xs text-slate-500">
                  {a.operating_area || '—'}
                </p>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="p-4 text-sm text-slate-400">
                No field agents found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2 flex flex-col">
          {activeAgent ? (
            <>
              <div className="p-3 border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-900">
                  {activeAgent.full_name || activeAgent.email || 'Field Agent'}
                </p>
                <p className="text-xs text-slate-500">
                  {activeAgent.email || ''}
                </p>
              </div>

              <CardContent className="p-4 flex-1 overflow-y-auto space-y-2">
                {loadingConversation ? (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    Opening conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No messages yet. Send the first message.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender_id === me?.id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                          m.sender_id === me?.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  ))
                )}

                <div ref={endRef} />
              </CardContent>

              <div className="p-3 border-t border-slate-200 flex gap-2">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type a message..."
                  disabled={loadingConversation}
                />

                <Button
                  onClick={send}
                  size="icon"
                  disabled={loadingConversation || !text.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center text-sm text-slate-400">
              Select an agent to start a conversation.
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}