import { useEffect, useMemo, useRef, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Input } from '@/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Search, SlidersHorizontal, RefreshCw, Users } from 'lucide-react';
import { queueLength, flushQueue, isOnline } from '@/lib/offline';
import { Button } from '@/ui/button';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 15;

export default function MyRegistrations() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [pendingSync, setPendingSync] = useState(queueLength());
  const [pullDistance, setPullDistance] = useState(0);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Registration.filter({}, '-created_date', 200);
      setRecords(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let r = records;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => `${x.first_name} ${x.surname} ${x.id_number || ''} ${x.community} ${x.ward}`.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      r = r.filter((x) => {
        if (statusFilter === 'verified') return x.verification_status === 'verified';
        if (statusFilter === 'flagged') return x.verification_status === 'flagged';
        if (statusFilter === 'pending') return x.verification_status === 'unverified';
        return true;
      });
    }
    return r;
  }, [records, search, statusFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const syncNow = async () => {
    setSyncing(true);
    const n = await flushQueue();
    setPendingSync(queueLength());
    if (n > 0) await load();
    setSyncing(false);
  };

  const onTouchStart = (e) => {
    if (window.scrollY === 0 && !pullRefreshing) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };
  const onTouchMove = (e) => {
    if (!isPulling.current || pullRefreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && window.scrollY === 0) setPullDistance(Math.min(delta * 0.5, 70));
  };
  const onTouchEnd = async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance > 50) {
      setPullRefreshing(true); setPullDistance(0);
      await load();
      setPullRefreshing(false);
    } else { setPullDistance(0); }
  };

  return (
    <div
      className="pb-20 select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#E9EDEF] px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-[#111B21]">Residents</h1>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-[#F0F2F5] rounded-full"><Search className="w-5 h-5 text-[#667781]" /></button>
            <button className="p-2 hover:bg-[#F0F2F5] rounded-full"><SlidersHorizontal className="w-5 h-5 text-[#667781]" /></button>
          </div>
        </div>
        <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search residents" className="h-10 bg-[#F0F2F5] border-0" />
      </div>

      <div className="px-4 pt-3">
        {/* Pull indicator */}
        <div className="flex items-center justify-center overflow-hidden transition-all duration-200" style={{ height: pullDistance }}>
          <RefreshCw className={`w-5 h-5 text-[#008F4C] ${pullRefreshing ? 'animate-spin' : ''}`} />
        </div>

        {/* Pending sync */}
        {pendingSync > 0 && (
          <div className="bg-[#FFF8E1] rounded-xl p-3 flex items-center justify-between mb-3">
            <p className="text-xs text-[#111B21]">{pendingSync} record(s) waiting to sync</p>
            <Button size="sm" onClick={syncNow} disabled={syncing || !isOnline()} className="bg-[#008F4C] text-white hover:bg-[#008F4C]">{syncing ? 'Syncing...' : 'Sync now'}</Button>
          </div>
        )}

        {/* Filter */}
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="h-10 mb-3"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-[#F0F2F5] rounded-xl animate-pulse" />)}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-[#667781] mx-auto mb-2 opacity-40" />
            <p className="text-sm text-[#667781]">No residents found.</p>
            <p className="text-xs text-[#667781] mt-1">Residents you register will appear here.</p>
            <button onClick={() => navigate('/app/new')} className="mt-3 px-4 py-2 bg-[#008F4C] text-white rounded-lg text-sm font-medium">
              Register Resident
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {pageItems.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-[#F0F2F5] rounded-xl cursor-pointer">
                <div className="w-11 h-11 rounded-full bg-[#008F4C] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                  {r.first_name?.charAt(0)}{r.surname?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#111B21] truncate">{r.first_name} {r.surname}</p>
                  <p className="text-xs text-[#667781] truncate">ID: {r.id_number ? `******${r.id_number.slice(-3)}` : '—'} · {r.community}</p>
                  <p className="text-[11px] text-[#667781]">{(r.created_date || '').slice(0, 10)}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${r.verification_status === 'verified' ? 'bg-[#D9FDD3] text-[#008F4C]' : r.verification_status === 'flagged' ? 'bg-red-100 text-[#EA4335]' : 'bg-[#F0F2F5] text-[#667781]'}`}>
                  {r.verification_status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-3 pb-4">
            <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</Button>
            <span className="text-xs text-[#667781]">Page {current} of {pages}</span>
            <Button variant="outline" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}