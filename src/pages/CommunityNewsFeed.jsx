import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Newspaper, ArrowLeft, Megaphone, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CAT_ICON = { announcement: Megaphone, news: Newspaper, update: Newspaper, alert: AlertCircle };
const CAT_CLS = { announcement: 'bg-[#D9FDD3] text-[#008F4C]', news: 'bg-blue-100 text-blue-700', update: 'bg-[#F0F2F5] text-[#667781]', alert: 'bg-red-100 text-[#EA4335]' };

export default function CommunityNewsFeed() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.CommunityUpdate.list('-created_date', 100);
      setUpdates(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 space-y-4 select-none">
      <div className="flex items-center gap-2">
        <Link to="/app" className="p-1.5 hover:bg-[#F0F2F5] rounded-full"><ArrowLeft className="w-5 h-5 text-[#111B21]" /></Link>
        <h1 className="text-lg font-bold text-[#111B21] flex items-center gap-2"><Newspaper className="w-5 h-5 text-[#008F4C]" /> Community Updates</h1>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#F0F2F5] rounded-xl animate-pulse" />)}</div>
      ) : updates.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <Newspaper className="w-8 h-8 text-[#667781] mx-auto mb-2 opacity-40" />
          <p className="text-sm text-[#667781]">No updates yet.</p>
          <p className="text-xs text-[#667781] mt-1">Official announcements will appear here.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {updates.map((u) => {
            const Icon = CAT_ICON[u.category] || Newspaper;
            return (
              <Card key={u.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${CAT_CLS[u.category] || CAT_CLS.announcement}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#111B21]">{u.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${CAT_CLS[u.category] || ''}`}>{u.category}</span>
                      </div>
                      <p className="text-sm text-[#667781] mt-1 leading-relaxed">{u.body}</p>
                      <p className="text-[11px] text-[#667781] mt-2">{u.author_name ? `${u.author_name} · ` : ''}{(u.created_date || '').slice(0, 10)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}