import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth-role';
import { useToast } from '@/ui/use-toast';
import { COUNTIES, constituenciesFor, wardsFor, communitiesFor } from '@/lib/geo';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUS_CLS = { planned: 'bg-sky-100 text-sky-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-slate-100 text-slate-500 line-through' };

export default function FieldCalendar() {
  const { user: me } = useCurrentUser();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: '', start_time: '', end_time: '', county: 'Nairobi', constituency: '', ward: '', community: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.FieldVisit.list('-visit_date', 200);
      setVisits(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const dateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const visitsOn = (day) => visits.filter((v) => v.visit_date === dateStr(day));

  const openNew = (day) => {
    setSelectedDate(dateStr(day));
    setForm({ title: '', start_time: '', end_time: '', county: 'Nairobi', constituency: '', ward: '', community: '', notes: '' });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !selectedDate) return;
    setSaving(true);
    try {
      await supabaseApi.entities.FieldVisit.create({
        agent_id: me.id,
        agent_name: me.full_name || me.email,
        title: form.title,
        visit_date: selectedDate,
        start_time: form.start_time,
        end_time: form.end_time,
        county: form.county,
        constituency: form.constituency,
        ward: form.ward,
        community: form.community,
        notes: form.notes,
        status: 'planned',
      });
      toast({ title: 'Visit scheduled' });
      setDialogOpen(false);
      load();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const updateStatus = async (v, status) => {
    await supabaseApi.entities.FieldVisit.update(v.id, { status });
    load();
  };

  const constituencies = constituenciesFor(form.county);
  const wards = wardsFor(form.county, form.constituency);
  const communities = communitiesFor(form.county, form.constituency, form.ward);

  return (
    <div className="p-4 space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-sky-600" /> Field Calendar
        </h1>
        <Button size="sm" onClick={() => { setSelectedDate(dateStr(new Date().getDate())); setForm({ title: '', start_time: '', end_time: '', county: 'Nairobi', constituency: '', ward: '', community: '', notes: '' }); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> New Visit
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-full">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <p className="text-sm font-semibold text-slate-900">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-full">
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dayVisits = visitsOn(day);
          const isToday = dateStr(day) === new Date().toISOString().slice(0, 10);
          return (
            <div
              key={i}
              onClick={() => openNew(day)}
              className={`min-h-[60px] sm:min-h-[80px] rounded-lg border p-1 cursor-pointer hover:bg-slate-50 ${isToday ? 'border-sky-400 bg-sky-50' : 'border-slate-200'}`}
            >
              <p className={`text-[11px] font-medium ${isToday ? 'text-sky-700' : 'text-slate-600'}`}>{day}</p>
              {dayVisits.slice(0, 2).map((v) => (
                <div key={v.id} className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded mt-0.5 truncate ${STATUS_CLS[v.status] || ''}`} onClick={(e) => { e.stopPropagation(); updateStatus(v, v.status === 'planned' ? 'completed' : 'cancelled'); }}>
                  {v.title}
                </div>
              ))}
              {dayVisits.length > 2 && <p className="text-[9px] text-slate-400 mt-0.5">+{dayVisits.length - 2} more</p>}
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Field Visit — {selectedDate}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Njiru community registration drive" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">Start time</label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-500">End time</label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">County</label>
                <Select value={form.county} onValueChange={(v) => setForm({ ...form, county: v, constituency: '', ward: '', community: '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Constituency</label>
                <Select value={form.constituency} onValueChange={(v) => setForm({ ...form, constituency: v, ward: '', community: '' })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{constituencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">Ward</label>
                <Select value={form.ward} onValueChange={(v) => setForm({ ...form, ward: v, community: '' })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{wards.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Community</label>
                <Select value={form.community} onValueChange={(v) => setForm({ ...form, community: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{communities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Notes</label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Visit objectives, contacts, etc." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title.trim()}>{saving ? 'Saving…' : 'Schedule Visit'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}