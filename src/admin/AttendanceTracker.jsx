import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Clock, LogIn, LogOut, Users } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth-role';
import { useToast } from '@/ui/use-toast';

export default function AttendanceTracker() {
  const { user: me } = useCurrentUser();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRecord, setMyRecord] = useState(null);
  const { toast } = useToast();

  const today = new Date().toISOString().slice(0, 10);
  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Attendance.list('-date', 200);
      setRecords(all);
      setMyRecord(all.find((r) => r.agent_id === me?.id && r.date === today) || null);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [me?.id]);

  const checkIn = async () => {
    try {
      const r = await supabaseApi.entities.Attendance.create({
        agent_id: me.id, agent_name: me.full_name || me.email,
        date: today, check_in_at: new Date().toISOString(), status: 'checked_in',
      });
      setMyRecord(r);
      toast({ title: 'Checked in' });
      load();
    } catch { toast({ title: 'Check-in failed', variant: 'destructive' }); }
  };

  const checkOut = async () => {
    if (!myRecord) return;
    try {
      await supabaseApi.entities.Attendance.update(myRecord.id, { check_out_at: new Date().toISOString(), status: 'checked_out' });
      toast({ title: 'Checked out' });
      load();
    } catch { toast({ title: 'Check-out failed', variant: 'destructive' }); }
  };

  const todayRecords = records.filter((r) => r.date === today);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] flex items-center gap-2"><Clock className="w-5 h-5 text-[#008F4C]" /> Attendance Tracker</h1>
        <p className="text-sm text-[#667781]">Log daily shift start and end times.</p>
      </div>

      {/* My attendance */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-[#111B21] mb-3">My Attendance — {new Date().toLocaleDateString()}</p>
          {myRecord ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><LogIn className="w-4 h-4 text-[#008F4C]" /><span className="text-sm text-[#667781]">Checked in</span></div>
                <span className="text-sm font-medium text-[#111B21]">{new Date(myRecord.check_in_at).toLocaleTimeString()}</span>
              </div>
              {myRecord.check_out_at && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><LogOut className="w-4 h-4 text-[#EA4335]" /><span className="text-sm text-[#667781]">Checked out</span></div>
                  <span className="text-sm font-medium text-[#111B21]">{new Date(myRecord.check_out_at).toLocaleTimeString()}</span>
                </div>
              )}
              {!myRecord.check_out_at && (
                <Button onClick={checkOut} className="w-full bg-[#EA4335] text-white"><LogOut className="w-4 h-4 mr-2" /> Check Out</Button>
              )}
            </div>
          ) : (
            <Button onClick={checkIn} className="w-full bg-[#008F4C] text-white"><LogIn className="w-4 h-4 mr-2" /> Check In</Button>
          )}
        </CardContent>
      </Card>

      {/* Today's attendance */}
      <div>
        <p className="text-sm font-medium text-[#111B21] mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-[#667781]" /> Today's Team Attendance</p>
        {loading ? <p className="text-sm text-[#667781]">Loading...</p> : todayRecords.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-sm text-[#667781]">No check-ins recorded today.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {todayRecords.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#111B21]">{r.agent_name}</p>
                    <p className="text-xs text-[#667781]">In: {new Date(r.check_in_at).toLocaleTimeString()}{r.check_out_at ? ` · Out: ${new Date(r.check_out_at).toLocaleTimeString()}` : ''}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full ${r.status === 'checked_in' ? 'bg-[#D9FDD3] text-[#008F4C]' : 'bg-[#F0F2F5] text-[#667781]'}`}>{r.status}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}