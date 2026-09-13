import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabaseApi } from '@/api/supabaseApi';
import { Input } from '@/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Search, MapPin, Flame, Users } from 'lucide-react';

const COUNTY_CENTERS = {
  Nairobi: [-1.2864, 36.8172],
  Kiambu: [-1.1715, 36.8268],
  Mombasa: [-4.0435, 39.6682],
  Kisumu: [-0.0917, 34.7680],
  Nakuru: [-0.3031, 36.0800],
};

export default function AdminMap() {
  const [sessions, setSessions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [regs, setRegs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('sessions');

  useEffect(() => {
    (async () => {
      try {
        const [s, a, r] = await Promise.all([
          supabaseApi.entities.LocationSession.filter({ status: { $in: ['active', 'paused'] } }, '-last_update_at', 100),
          supabaseApi.entities.User.list('-created_date', 200),
          supabaseApi.entities.Registration.list('-created_date', 2000),
        ]);
        setSessions(s);
        setAgents(a.filter((u) => u.role === 'field_agent'));
        setRegs(r);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a]));
  const visibleSessions = sessions.filter((s) => {
    if (!search.trim()) return true;
    const a = agentMap[s.agent_id];
    return `${a?.full_name || ''} ${s.ward || ''}`.toLowerCase().includes(search.toLowerCase());
  });
  const sessionPoints = visibleSessions.filter((s) => s.last_lat != null && s.last_lng != null);

  // Registration density by county
  const regsByCounty = {};
  regs.forEach((r) => { if (r.county) regsByCounty[r.county] = (regsByCounty[r.county] || 0) + 1; });
  const maxCountyCount = Math.max(1, ...Object.values(regsByCounty));
  const densityPoints = Object.entries(regsByCounty)
    .filter(([county]) => COUNTY_CENTERS[county])
    .map(([county, count]) => ({ county, count, center: COUNTY_CENTERS[county] }));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Field Map</h1>
          <p className="text-sm text-slate-500">{view === 'sessions' ? 'Authorized active field sessions only.' : 'Registration density by county.'}</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <Button size="sm" variant={view === 'sessions' ? 'default' : 'ghost'} onClick={() => setView('sessions')}>
            <Users className="w-3.5 h-3.5 mr-1" />Sessions
          </Button>
          <Button size="sm" variant={view === 'density' ? 'default' : 'ghost'} onClick={() => setView('density')}>
            <Flame className="w-3.5 h-3.5 mr-1" />Density
          </Button>
        </div>
      </div>

      {view === 'sessions' && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agent or area…" className="pl-9" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 overflow-hidden">
          <div className="h-[480px] w-full">
            <MapContainer center={[-1.2864, 36.8172]} zoom={6} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {view === 'sessions' && sessionPoints.map((s) => (
                <CircleMarker key={s.id} center={[s.last_lat, s.last_lng]} radius={10} fillOpacity={0.6}
                  pathOptions={{ color: s.status === 'paused' ? '#d97706' : '#0284c7' }}>
                  <Popup>
                    <b>{agentMap[s.agent_id]?.full_name || 'Agent'}</b><br />
                    Status: {s.status}<br />
                    Ward: {s.ward || '—'}<br />
                    Updated: {s.last_update_at}
                  </Popup>
                </CircleMarker>
              ))}
              {view === 'density' && densityPoints.map((d) => {
                const radius = 15 + Math.round((d.count / maxCountyCount) * 40);
                const intensity = d.count / maxCountyCount;
                const color = intensity > 0.66 ? '#dc2626' : intensity > 0.33 ? '#f97316' : '#fbbf24';
                return (
                  <CircleMarker key={d.county} center={d.center} radius={radius} fillOpacity={0.45}
                    pathOptions={{ color, fillColor: color }}>
                    <Popup>
                      <b>{d.county}</b><br />
                      Registrations: {d.count}
                    </Popup>
                    <LeafletTooltip>{d.county}: {d.count} registrations</LeafletTooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </Card>

        <Card>
          {view === 'sessions' ? (
            <>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Active Sessions ({visibleSessions.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[440px] overflow-y-auto">
                {visibleSessions.length === 0 ? (
                  <p className="text-sm text-slate-400">No active field sessions.</p>
                ) : visibleSessions.map((s) => {
                  const a = agentMap[s.agent_id];
                  return (
                    <div key={s.id} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" />
                        <p className="text-sm font-medium text-slate-900">{a?.full_name || 'Agent'}</p>
                      </div>
                      <p className="text-xs text-slate-500">{s.ward || '—'}</p>
                      <p className="text-xs text-slate-400 mt-1">Updated {s.last_update_at?.slice(11, 16) || '—'}</p>
                      <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                    </div>
                  );
                })}
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Density by County</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[440px] overflow-y-auto">
                {densityPoints.length === 0 ? (
                  <p className="text-sm text-slate-400">No registration data.</p>
                ) : densityPoints.sort((a, b) => b.count - a.count).map((d) => (
                  <div key={d.county} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{d.county}</p>
                      <p className="text-sm font-bold text-slate-700">{d.count}</p>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full" style={{ width: `${(d.count / maxCountyCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}