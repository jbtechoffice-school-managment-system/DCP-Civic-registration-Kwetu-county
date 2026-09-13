import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { ShieldCheck, AlertTriangle, Merge } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { logAudit } from '@/lib/audit';

export default function DataIntegrityCheck() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Registration.list('-created_date', 1000);
      setRegs(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const duplicates = useMemo(() => {
    const groups = {};
    regs.forEach((r) => {
      const key = r.id_number ? `id:${r.id_number}` : `name:${r.first_name?.toLowerCase()}:${r.surname?.toLowerCase()}:${r.ward}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return Object.entries(groups).filter(([, items]) => items.length > 1).map(([key, items]) => ({ key, items }));
  }, [regs]);

  const mergeDuplicate = async (group) => {
    const keep = group.items[0];
    const remove = group.items.slice(1);
    try {
      await supabaseApi.entities.Registration.deleteMany({ id: { $in: remove.map((r) => r.id) } });
      await logAudit('duplicate_merged', keep.id, `Merged ${remove.length} duplicate(s)`);
      toast({ title: 'Duplicates merged', description: `Kept record for ${keep.first_name} ${keep.surname}.` });
      load();
    } catch { toast({ title: 'Merge failed', variant: 'destructive' }); }
  };

  const scan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 1000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#008F4C]" /> Data Integrity Check</h1>
          <p className="text-sm text-[#667781]">Scan and merge duplicate registration entries.</p>
        </div>
        <Button onClick={scan} variant="outline" disabled={scanning || loading}><ShieldCheck className="w-4 h-4 mr-2" /> {scanning ? 'Scanning...' : 'Scan Now'}</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F0F2F5] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#111B21]">{regs.length}</p>
          <p className="text-xs text-[#667781] mt-0.5">Total Records</p>
        </div>
        <div className="bg-[#F0F2F5] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#EA4335]">{duplicates.length}</p>
          <p className="text-xs text-[#667781] mt-0.5">Duplicate Groups</p>
        </div>
      </div>

      {loading || scanning ? (
        <p className="text-sm text-[#667781] text-center py-8">{scanning ? 'Scanning for duplicates...' : 'Loading...'}</p>
      ) : duplicates.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <ShieldCheck className="w-8 h-8 text-[#008F4C] mx-auto mb-2" />
          <p className="text-sm text-[#111B21] font-medium">No duplicates found!</p>
          <p className="text-xs text-[#667781] mt-1">Your database is clean.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {duplicates.map((group, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#F7C948]" />
                  <p className="text-sm font-medium text-[#111B21]">{group.items.length} duplicates found</p>
                </div>
                <div className="space-y-2 mb-3">
                  {group.items.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-2 bg-[#F0F2F5] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#111B21]">{r.first_name} {r.surname}</p>
                        <p className="text-xs text-[#667781]">ID: {r.id_number || '—'} · {r.ward}</p>
                      </div>
                      <span className="text-[11px] text-[#667781]">{(r.created_date || '').slice(0, 10)}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => mergeDuplicate(group)} size="sm" className="w-full bg-[#008F4C] text-white">
                  <Merge className="w-4 h-4 mr-2" /> Merge (keep first record)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}