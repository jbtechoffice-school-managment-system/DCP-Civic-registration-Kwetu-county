import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { BarChart3, MapPin } from 'lucide-react';
import { COUNTIES, constituenciesFor, wardsFor } from '@/lib/geo';

export default function RegionalAnalytics() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [county, setCounty] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Registration.list('-created_date', 1000);
      setRegs(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = county === 'all' ? regs : regs.filter((r) => r.county === county);

  const byConstituency = useMemo(() => {
    const m = {};
    filtered.forEach((r) => { if (r.constituency) m[r.constituency] = (m[r.constituency] || 0) + 1; });
    return Object.entries(m).map(([k, v]) => ({ name: k, count: v })).sort((a, b) => b.count - a.count);
  }, [filtered]);

  const byWard = useMemo(() => {
    const m = {};
    filtered.forEach((r) => { if (r.ward) m[r.ward] = (m[r.ward] || 0) + 1; });
    return Object.entries(m).map(([k, v]) => ({ name: k, count: v })).sort((a, b) => b.count - a.count);
  }, [filtered]);

  const maxCon = Math.max(...byConstituency.map((d) => d.count), 1);
  const maxWard = Math.max(...byWard.map((d) => d.count), 1);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#008F4C]" /> Regional Analytics</h1>
        <p className="text-sm text-[#667781]">Registration breakdown by constituency and ward.</p>
      </div>

      <Select value={county} onValueChange={setCounty}>
        <SelectTrigger className="sm:w-56"><SelectValue placeholder="Filter by county" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All counties</SelectItem>
          {COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      {loading ? (
        <p className="text-sm text-[#667781] text-center py-8">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-[#111B21] mb-3">By Constituency</p>
              {byConstituency.length === 0 ? <p className="text-sm text-[#667781]">No data.</p> : (
                <div className="space-y-3">
                  {byConstituency.map((c) => (
                    <div key={c.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[#111B21]">{c.name}</span>
                        <span className="text-xs text-[#667781]">{c.count}</span>
                      </div>
                      <div className="h-2.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                        <div className="h-full bg-[#008F4C] rounded-full" style={{ width: `${(c.count / maxCon) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-[#111B21] mb-3">By Ward</p>
              {byWard.length === 0 ? <p className="text-sm text-[#667781]">No data.</p> : (
                <div className="space-y-3">
                  {byWard.map((w) => (
                    <div key={w.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[#111B21]">{w.name}</span>
                        <span className="text-xs text-[#667781]">{w.count}</span>
                      </div>
                      <div className="h-2.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                        <div className="h-full bg-[#25D366] rounded-full" style={{ width: `${(w.count / maxWard) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}