import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AgentNotifications() {
  const navigate = useNavigate();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const load = async () => {
    try {
      const list = await supabaseApi.entities.Notification.list('-created_date', 100);
      setAll(list);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const markRead = async (n) => {
    if (n.read) return;
    await supabaseApi.entities.Notification.update(n.id, { read: true });
    load();
  };

  const visible = all.filter((n) => {
    if (tab === 'unread') return !n.read;
    if (tab === 'read') return n.read;
    return true;
  });

  const unreadCount = all.filter((n) => !n.read).length;

  return (
    <div className="p-4 space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-full select-none">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
        </div>
        {unreadCount > 0 && <span className="text-xs font-medium px-2 py-1 rounded-full bg-sky-100 text-sky-700">{unreadCount} unread</span>}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
          <TabsTrigger value="read" className="flex-1">Read</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-3 space-y-2">
          {loading ? <p className="text-sm text-slate-400">Loading…</p> :
            visible.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-sm text-slate-400 flex flex-col items-center gap-2"><Bell className="w-6 h-6 text-slate-300" />No notifications.</CardContent></Card>
            ) : visible.map((n) => (
              <Card key={n.id} className={`border-slate-200 cursor-pointer ${!n.read ? 'border-l-4 border-l-sky-500' : ''}`} onClick={() => markRead(n)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{n.category}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{n.created_date}</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}