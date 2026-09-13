import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Progress } from '@/ui/progress';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Target, Plus, X } from 'lucide-react';
import { useToast } from '@/ui/use-toast';

export default function GoalsSection() {
  const { toast } = useToast();
  const [goals, setGoals] = useState([]);
  const [agents, setAgents] = useState([]);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ agent_id: '', target_count: 10, period: 'weekly', period_start: new Date().toISOString().slice(0, 10) });

  const load = async () => {
    try {
      const [g, u, r] = await Promise.all([
        supabaseApi.entities.Goal.list('-created_date', 100),
        supabaseApi.entities.User.list('-created_date', 200),
        supabaseApi.entities.Registration.list('-created_date', 1000),
      ]);
      setGoals(g);
      setAgents(u.filter((u) => u.role === 'field_agent'));
      setRegs(r);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const agentName = (id) => agents.find((a) => a.id === id)?.full_name || 'Unknown';
  const countFor = (id, goal) => {
    const start = goal.period_start;
    const end = goal.period_end || new Date().toISOString().slice(0, 10);
    return regs.filter((r) => r.created_by_id === id && (r.created_date || '').slice(0, 10) >= start && (r.created_date || '').slice(0, 10) <= end).length;
  };

  const createGoal = async () => {
    if (!newGoal.agent_id || !newGoal.target_count) return;
    try {
      const end = new Date(newGoal.period_start);
      if (newGoal.period === 'daily') end.setDate(end.getDate() + 1);
      if (newGoal.period === 'weekly') end.setDate(end.getDate() + 7);
      if (newGoal.period === 'monthly') end.setMonth(end.getMonth() + 1);
      await supabaseApi.entities.Goal.create({
        ...newGoal,
        agent_name: agentName(newGoal.agent_id),
        target_count: Number(newGoal.target_count),
        period_end: end.toISOString().slice(0, 10),
      });
      toast({ title: 'Goal assigned successfully' });
      setShowForm(false);
      setNewGoal({ agent_id: '', target_count: 10, period: 'weekly', period_start: new Date().toISOString().slice(0, 10) });
      load();
    } catch { toast({ title: 'Could not assign goal', variant: 'destructive' }); }
  };

  const deleteGoal = async (id) => {
    await supabaseApi.entities.Goal.delete(id);
    load();
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4 text-sky-600" /> Registration Goals</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}><Plus className="w-3.5 h-3.5 mr-1" /> Assign Goal</Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-4 p-3 border border-slate-200 rounded-lg space-y-3 bg-slate-50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Agent</Label>
                <Select value={newGoal.agent_id} onValueChange={(v) => setNewGoal({ ...newGoal, agent_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                  <SelectContent>{agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name || a.email}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Target count</Label>
                <Input type="number" value={newGoal.target_count} onChange={(e) => setNewGoal({ ...newGoal, target_count: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Period</Label>
                <Select value={newGoal.period} onValueChange={(v) => setNewGoal({ ...newGoal, period: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Start date</Label>
                <Input type="date" value={newGoal.period_start} onChange={(e) => setNewGoal({ ...newGoal, period_start: e.target.value })} />
              </div>
            </div>
            <Button size="sm" onClick={createGoal}>Save Goal</Button>
          </div>
        )}

        {goals.length === 0 ? (
          <p className="text-sm text-slate-400">No goals assigned yet. Click "Assign Goal" to set targets for agents.</p>
        ) : (
          <div className="space-y-3">
            {goals.map((g) => {
              const current = countFor(g.agent_id, g);
              const pct = g.target_count > 0 ? Math.min(100, Math.round((current / g.target_count) * 100)) : 0;
              const met = current >= g.target_count;
              return (
                <div key={g.id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{agentName(g.agent_id)}</p>
                      <p className="text-[11px] text-slate-500 capitalize">{g.period} goal · {g.period_start} → {g.period_end || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${met ? 'text-green-600' : 'text-slate-700'}`}>{current}/{g.target_count}</span>
                      {met && <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">MET</span>}
                      <button onClick={() => deleteGoal(g.id)} className="text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <Progress value={pct} className={`h-2 ${met ? '[&>div]:bg-green-500' : ''}`} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}