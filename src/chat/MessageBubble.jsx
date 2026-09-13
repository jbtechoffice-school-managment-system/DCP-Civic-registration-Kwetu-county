import { Check, CheckCheck } from 'lucide-react';
import { Image as UIImage } from '@/ui/image';

export default function MessageBubble({ message, isMine }) {
  const isText = !message.message_type || message.message_type === 'text';
  const isImage = message.message_type === 'image';
  const isVoice = message.message_type === 'voice';
  const time = message.created_date
    ? new Date(message.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3 py-2 ${
          isMine ? 'bg-[#D9FDD3] text-[#111B21] rounded-br-sm' : 'bg-white text-[#111B21] rounded-bl-sm shadow-sm border border-[#E9EDEF]'
        }`}
      >
        {isText && <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>}

        {isImage && message.media_url && (
          <UIImage src={message.media_url} alt="shared" className="rounded-lg max-w-full max-h-56" fittingType="fit" />
        )}

        {isVoice && message.media_url && (
          <div className="flex items-center gap-2">
            <audio controls src={message.media_url} className="h-8 max-w-[200px]" />
            {message.media_duration ? <span className="text-xs opacity-80">{Math.round(message.media_duration)}s</span> : null}
          </div>
        )}

        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] opacity-70">{time}</span>
          {isMine && (
            message.status === 'read' ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#008F4C]" />
            ) : message.status === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#667781]" />
            ) : (
              <Check className="w-3.5 h-3.5 text-[#667781]" />
            )
          )}
        </div>
      </div>
    </div>
  );
}