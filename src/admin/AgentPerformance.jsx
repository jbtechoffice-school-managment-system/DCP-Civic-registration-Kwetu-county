import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/ui/use-toast';

function weekStart(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().slice(0, 10);
}
function weekEnd(start) {
  const d = new Date(start);
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

export default function AgentPerformance() {
  const { toast } = useToast();
  const [agents, setAgents] = useState([]);
  const [regs, setRegs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [goalValue, setGoalValue] = useState('');
  const [goalPeriod, setGoalPeriod] = useState('weekly');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [users, allRegs, allGoals] = await Promise.all([
        supabaseApi.entities.User.list('-created_date', 200),
        supabaseApi.entities.Registration.list('-created_date', 1000),
        supabaseApi.entities.Goal.list('-created_date', 200),
      ]);
      setAgents(users.filter((u) => u.role === 'field_agent'));
      setRegs(allRegs);
      setGoals(allGoals);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const ws = weekStart();
  const we = weekEnd(ws);

  const countsByAgent = {};
  regs.forEach((r) => { countsByAgent[r.created_by_id] = (countsByAgent[r.created_by_id] || 0) + 1; });

  const currentGoalFor = (agentId) => goals.find((g) => g.agent_id === agentId && g.period_start === ws);

  const openSetGoal = (agent) => {
    const existing = currentGoalFor(agent.id);
    setEditing(agent);
    setGoalValue(existing ? String(existing.target_count) : '50');
    setGoalPeriod(existing?.period || 'weekly');
  };

  const saveGoal = async () => {
    const target = parseInt(goalValue, 10);
    if (!target || target < 1) { toast({ title: 'Enter a valid target', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const existing = currentGoalFor(editing.id);
      if (existing) {
        await supabaseApi.entities.Goal.update(existing.id, { target_count: target });
      } else {
        await supabaseApi.entities.Goal.create({
          agent_id: editing.id,
          target_count: target,
          period: goalPeriod,
          period_start: ws,
          period_end: we,
        });
      }
      toast({ title: 'Goal saved', description: `${editing.full_name || editing.email}: ${target} registrations` });
      setEditing(null);
      load();
    } catch (e) {
      toast({ title: 'Could not save goal', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agent Performance</h1>
        <p className="text-sm text-slate-500">Set registration targets and track progress for the week of {ws}.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : agents.length === 0 ? (
        <p className="text-sm text-slate-400">No field agents found.</p>
      ) : (
        <div className="grid gap-3">
          {agents.map((a) => {
            const count = countsByAgent[a.id] || 0;
            const goal = currentGoalFor(a.id);
            const target = goal?.target_count || 0;
            const pct = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
            return (
              <Card key={a.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{a.full_name || a.email}</p>
                      <p className="text-xs text-slate-500">{count} registrations total</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openSetGoal(a)}>
                      <Target className="w-3.5 h-3.5 mr-1" />{goal ? 'Edit Goal' : 'Set Goal'}
                    </Button>
                  </div>
                  {target > 0 ? (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">Progress: {count} / {target}</span>
                        <span className={`font-medium ${pct >= 100 ? 'text-green-600' : pct >= 50 ? 'text-sky-600' : 'text-amber-600'}`}>{pct}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-sky-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                      {pct >= 100 && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Target achieved!</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No goal set for this period.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Goal — {editing?.full_name || editing?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Target registrations</label>
              <Input type="number" value={goalValue} onChange={(e) => setGoalValue(e.target.value)} min="1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Period</label>
              <Select value={goalPeriod} onValueChange={setGoalPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400 mt-1">{ws} to {we}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveGoal} disabled={saving}>{saving ? 'Saving…' : 'Save Goal'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}