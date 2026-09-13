import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { logAudit } from '@/lib/audit';

export default function SyncConflicts() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Registration.filter({ sync_status: 'pending_sync' }, '-created_date', 200);
      setConflicts(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const resolve = async (r) => {
    setResolving(r.id);
    try {
      await supabaseApi.entities.Registration.update(r.id, { sync_status: 'synced' });
      await logAudit('sync_conflict_resolved', r.id);
      toast({ title: 'Conflict resolved', description: `${r.first_name} ${r.surname} marked as synced.` });
      load();
    } catch { toast({ title: 'Resolution failed', variant: 'destructive' }); }
    finally { setResolving(null); }
  };

  const resolveAll = async () => {
    setResolving('all');
    try {
      await supabaseApi.entities.Registration.updateMany(
        { sync_status: 'pending_sync' },
        { $set: { sync_status: 'synced' } }
      );
      await logAudit('sync_conflicts_resolved_all');
      toast({ title: 'All conflicts resolved' });
      load();
    } catch { toast({ title: 'Bulk resolution failed', variant: 'destructive' }); }
    finally { setResolving(null); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Sync Conflict Resolution
          </h1>
          <p className="text-sm text-slate-500">Resolve registrations stuck in pending sync state.</p>
        </div>
        {conflicts.length > 0 && (
          <Button onClick={resolveAll} disabled={resolving === 'all'} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" /> Resolve All
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Loading…</p>
      ) : conflicts.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">No sync conflicts detected.</p>
          <p className="text-xs text-slate-400 mt-1">All registrations are synced.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {conflicts.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{r.first_name} {r.surname}</p>
                  <p className="text-xs text-slate-500">{r.community}, {r.ward}, {r.county}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{(r.created_date || '').slice(0, 19).replace('T', ' ')} · {r.id.slice(-8)}</p>
                </div>
                <Button size="sm" onClick={() => resolve(r)} disabled={resolving === r.id || resolving === 'all'}>
                  {resolving === r.id ? 'Resolving…' : 'Resolve'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}