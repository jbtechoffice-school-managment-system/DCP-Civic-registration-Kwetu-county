import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Smartphone, RefreshCw } from 'lucide-react';

export default function DeviceManagement() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.Device.list('-last_sync_at', 200);
      setDevices(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const formatTime = (ts) => {
    if (!ts) return 'Never';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] flex items-center gap-2"><Smartphone className="w-5 h-5 text-[#008F4C]" /> Device Management</h1>
        <p className="text-sm text-[#667781]">Agent device status, sync times, and app version tracking.</p>
      </div>

      {loading ? (
        <p className="text-sm text-[#667781] text-center py-8">Loading...</p>
      ) : devices.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <Smartphone className="w-8 h-8 text-[#667781] mx-auto mb-2 opacity-40" />
          <p className="text-sm text-[#667781]">No devices registered.</p>
          <p className="text-xs text-[#667781] mt-1">Devices will appear here when agents sync their app.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {devices.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${d.status === 'active' ? 'bg-[#D9FDD3]' : 'bg-[#F0F2F5]'}`}>
                  <Smartphone className={`w-5 h-5 ${d.status === 'active' ? 'text-[#008F4C]' : 'text-[#667781]'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#111B21] truncate">{d.agent_name || 'Unknown agent'}</p>
                  <p className="text-xs text-[#667781] truncate">{d.device_name || 'Unknown device'} · {d.platform || '—'}</p>
                  <p className="text-[11px] text-[#667781] flex items-center gap-1 mt-0.5"><RefreshCw className="w-3 h-3" /> Last sync: {formatTime(d.last_sync_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[11px] px-2 py-1 rounded-full ${d.status === 'active' ? 'bg-[#D9FDD3] text-[#008F4C]' : 'bg-[#F0F2F5] text-[#667781]'}`}>{d.status}</span>
                  {d.app_version && <p className="text-[11px] text-[#667781] mt-1">v{d.app_version}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}