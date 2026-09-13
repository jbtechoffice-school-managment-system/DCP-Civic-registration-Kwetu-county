import { useState, useEffect, useRef } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInputBar from './ChatInputBar';

export default function ChatWindow({ conversation, me, title, subtitle, onBack }) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load messages + mark received as read
  useEffect(() => {
    if (!conversation?.id || !me?.id) return;
    setLoading(true);
    setMessages([]);
    (async () => {
      try {
        const msgs = await supabaseApi.entities.Message.filter(
          { conversation_id: conversation.id },
          'created_date',
          200
        );
        setMessages(msgs);
        const unread = msgs.filter((m) => m.sender_id !== me.id && m.status !== 'read');
        await Promise.all(
          unread.map((m) => supabaseApi.entities.Message.update(m.id, { status: 'read' }).catch(() => {}))
        );
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [conversation?.id, me?.id]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = supabaseApi.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== conversation.id) return;
      if (event.type === 'create') {
        setMessages((prev) =>
          prev.some((m) => m.id === event.data.id) ? prev : [...prev, event.data]
        );
        if (event.data.sender_id !== me?.id) {
          supabaseApi.entities.Message.update(event.data.id, { status: 'read' }).catch(() => {});
        }
      } else if (event.type === 'update') {
        setMessages((prev) =>
          prev.map((m) => (m.id === event.data.id ? { ...m, ...event.data } : m))
        );
      }
    });
    return unsub;
  }, [conversation?.id, me?.id]);

  // Subscribe to conversation (typing indicator)
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = supabaseApi.entities.Conversation.subscribe((event) => {
      if (event.data?.id !== conversation.id) return;
      if (event.type === 'update') {
        setTyping(!!event.data.typing_user_id && event.data.typing_user_id !== me?.id);
      }
    });
    return unsub;
  }, [conversation?.id, me?.id]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleSend = async (data) => {
    if (!conversation || !me) return;
    try {
      const m = await supabaseApi.entities.Message.create({
        conversation_id: conversation.id,
        sender_id: me.id,
        body: data.body,
        message_type: data.message_type || 'text',
        media_url: data.media_url,
        media_duration: data.media_duration,
        status: 'sent',
      });
      await supabaseApi.entities.Conversation.update(conversation.id, {
        last_message:
          data.message_type === 'image' ? '📷 Photo' : data.message_type === 'voice' ? '🎤 Voice note' : data.body,
        last_message_at: new Date().toISOString(),
        typing_user_id: '',
      });
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    } catch (e) {
      console.warn('send failed', e);
    }
  };

  const handleTyping = (isTyping) => {
    if (!conversation) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTyping) {
      supabaseApi.entities.Conversation.update(conversation.id, { typing_user_id: me?.id }).catch(() => {});
      typingTimeoutRef.current = setTimeout(() => {
        supabaseApi.entities.Conversation.update(conversation.id, { typing_user_id: '' }).catch(() => {});
      }, 3000);
    } else {
      supabaseApi.entities.Conversation.update(conversation.id, { typing_user_id: '' }).catch(() => {});
    }
  };

  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 flex items-center gap-2 bg-white shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-full md:hidden shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-sm text-slate-600 shrink-0">
          {title?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
          <p className="text-xs text-slate-500">
            {typing ? <span className="text-[#008F4C]">typing…</span> : subtitle}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5 bg-slate-50">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-8">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No messages yet. Say hello!</p>
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} isMine={m.sender_id === me?.id} />
            ))}
            {typing && (
              <div className="flex justify-start mb-1">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <ChatInputBar onSend={handleSend} onTypingChange={handleTyping} disabled={loading || !me} />
    </div>
  );
}