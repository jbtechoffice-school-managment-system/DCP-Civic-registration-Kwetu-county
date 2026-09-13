import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { BookOpen, ArrowLeft, FileText, Video, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CAT_LABELS = { training: 'Training', brochure: 'Brochure', guide: 'Field Guide', policy: 'Policy', other: 'Other' };

export default function TrainingHub() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.ContentLibraryItem.list('-created_date', 100);
      setItems(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 space-y-4 select-none">
      <div className="flex items-center gap-2">
        <Link to="/app" className="p-1.5 hover:bg-[#F0F2F5] rounded-full"><ArrowLeft className="w-5 h-5 text-[#111B21]" /></Link>
        <h1 className="text-lg font-bold text-[#111B21] flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#008F4C]" /> Training Hub</h1>
      </div>

      <Card className="bg-[#D9FDD3] border-[#008F4C]/20">
        <CardContent className="p-4 flex items-center gap-3">
          <Video className="w-8 h-8 text-[#008F4C] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#008F4C]">Learn the app</p>
            <p className="text-xs text-[#667781]">Guides, videos, and best practices for field agents.</p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-[#F0F2F5] rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <BookOpen className="w-8 h-8 text-[#667781] mx-auto mb-2 opacity-40" />
          <p className="text-sm text-[#667781]">No training materials yet.</p>
          <p className="text-xs text-[#667781] mt-1">Check back later for guides and resources.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D9FDD3] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#008F4C]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#111B21] truncate">{item.title}</p>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F0F2F5] text-[#667781]">{CAT_LABELS[item.category] || item.category}</span>
                  {item.description && <p className="text-xs text-[#667781] mt-1 line-clamp-2">{item.description}</p>}
                </div>
                {item.file_url && (
                  <a href={item.file_url} target="_blank" rel="noreferrer" className="p-2 text-[#008F4C] shrink-0"><ExternalLink className="w-4 h-4" /></a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-[#111B21] mb-2">Quick Tips</p>
          <ul className="space-y-2 text-xs text-[#667781]">
            <li>• Always get consent before registering a resident.</li>
            <li>• Check for duplicates before submitting.</li>
            <li>• If offline, records sync automatically when you reconnect.</li>
            <li>• Start a field session to log your location during outreach.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}