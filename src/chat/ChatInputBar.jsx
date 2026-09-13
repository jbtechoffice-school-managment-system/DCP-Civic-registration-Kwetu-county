import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, Square } from 'lucide-react';
import { supabaseApi } from '@/api/supabaseApi';

export default function ChatInputBar({ onSend, onTypingChange, disabled }) {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordTimeRef = useRef(0);

  const handleTextChange = (e) => {
    setText(e.target.value);
    onTypingChange?.(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTypingChange?.(false), 2000);
  };

  const sendText = () => {
    if (!text.trim() || disabled) return;
    onSend({ body: text.trim(), message_type: 'text' });
    setText('');
    onTypingChange?.(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await supabaseApi.integrations.Core.UploadFile({ file });
      onSend({ body: '📷 Photo', message_type: 'image', media_url: file_url });
    } catch (err) {
      console.warn('upload failed', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const duration = recordTimeRef.current;
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setUploading(true);
        try {
          const { file_url } = await supabaseApi.integrations.Core.UploadFile({ file });
          onSend({ body: '🎤 Voice note', message_type: 'voice', media_url: file_url, media_duration: duration });
        } catch (err) {
          console.warn('voice upload failed', err);
        } finally {
          setUploading(false);
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      recordTimeRef.current = 0;
      setRecordTime(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        recordTimeRef.current += 1;
        setRecordTime(recordTimeRef.current);
      }, 1000);
    } catch (err) {
      console.warn('mic access denied', err);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="p-2 sm:p-3 border-t border-slate-200 bg-white shrink-0">
      {uploading && <p className="text-xs text-slate-400 mb-1 px-2">Uploading…</p>}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || recording || uploading}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full disabled:opacity-40 shrink-0"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        {recording ? (
          <button onClick={stopRecording} className="p-2 text-red-500 hover:bg-red-50 rounded-full shrink-0">
            <Square className="w-5 h-5 fill-current" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={disabled || uploading}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full disabled:opacity-40 shrink-0"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
        {recording ? (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-red-50 rounded-full">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-600 font-medium">Recording… {recordTime}s</span>
          </div>
        ) : (
          <input
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendText();
              }
            }}
            placeholder="Type a message…"
            disabled={disabled}
            className="flex-1 px-3 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400 min-w-0"
          />
        )}
        <button
          onClick={sendText}
          disabled={disabled || !text.trim() || recording}
          className="p-2.5 bg-[#008F4C] text-white rounded-full disabled:opacity-40 hover:bg-[#008F4C] shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}