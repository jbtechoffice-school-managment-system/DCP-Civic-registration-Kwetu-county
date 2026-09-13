import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { RefreshCw, Wifi, WifiOff, Database, Clock, ArrowLeft } from 'lucide-react';
import { queueLength } from '@/lib/offline';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';

export default function SystemStatus() {
  const navigate = useNavigate();
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pending, setPending] = useState(queueLength());
  const [lastSync, setLastSync] = useState(() => {
    try { return localStorage.getItem('civic-last-sync') || 'Never'; } catch { return 'Never'; }
  });

  useEffect(() => {
    const up = () => { setOnline(true); setLastSync(new Date().toLocaleString()); try { localStorage.setItem('civic-last-sync', new Date().toISOString()); } catch {} };
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setPending(queueLength()), 3000);
    return () => clearInterval(interval);
  }, []);

  const statuses = [
    { label: 'Internet Connection', value: online ? 'Connected' : 'Disconnected', icon: online ? Wifi : WifiOff, ok: online },
    { label: 'Sync Status', value: pending > 0 ? `${pending} records pending` : 'All synced', icon: RefreshCw, ok: pending === 0 },
    { label: 'Database', value: 'Operational', icon: Database, ok: true },
    { label: 'Last Sync', value: lastSync, icon: Clock, ok: true },
  ];

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Status</h1>
        <p className="text-sm text-slate-500">Current sync health and connection status.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statuses.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.ok ? 'bg-green-100' : 'bg-amber-100'}`}>
                  <s.icon className={`w-5 h-5 ${s.ok ? 'text-green-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{s.label}</p>
                  <p className="text-sm font-semibold text-slate-900">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Sync Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Pending records in queue</span>
            <span className={`text-sm font-semibold ${pending > 0 ? 'text-amber-600' : 'text-green-600'}`}>{pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Connection state</span>
            <span className={`text-sm font-semibold ${online ? 'text-green-600' : 'text-amber-600'}`}>{online ? 'Online — will sync' : 'Offline — queuing'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Auto-sync</span>
            <span className="text-sm font-semibold text-green-600">Enabled</span>
          </div>
          {pending > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mt-2">
              <p className="text-xs text-amber-800">You have {pending} record(s) waiting to sync. They will upload automatically when your connection is restored.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}