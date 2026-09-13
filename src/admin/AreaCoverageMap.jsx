import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LTip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';

const WARD_COORDS = {
  'Kasarani': [-1.2186, 36.8888], 'Njiru': [-1.2267, 36.9056], 'Ruai': [-1.2517, 36.9183],
  'Mwiki': [-1.2097, 36.8903], 'Clay City': [-1.2247, 36.8897], 'Mihango': [-1.2317, 36.9117], 'Saika': [-1.2383, 36.9050],
};

export default function AreaCoverageMap() {
  const navigate = useNavigate();
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { try { setRegs(await supabaseApi.entities.Registration.list('-created_date', 2000)); } catch {} finally { setLoading(false); } })();
  }, []);

  const byWard = useMemo(() => {
    const map = {};
    regs.forEach((r) => { const w = r.ward || 'Unknown'; map[w] = (map[w] || 0) + 1; });
    return Object.entries(map).map(([ward, count]) => ({ ward, count, ...(WARD_COORDS[ward] || { lat: -1.22, lng: 36.89 }) }));
  }, [regs]);

  const maxCount = Math.max(1, ...byWard.map((w) => w.count));

  return (
    <div className="p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Area Coverage Map</h1>
        <p className="text-sm text-slate-500">Completed registration volumes by ward and sub-county for outreach planning.</p>
      </div>
      {loading ? <p className="text-sm text-slate-400">Loading…</p> : (
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2"><CardContent className="p-0">
            <MapContainer center={[-1.22, 36.89]} zoom={12} style={{ height: '500px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {byWard.map((w) => (
                <CircleMarker key={w.ward} center={[w.lat, w.lng]} radius={12 + (w.count / maxCount) * 30} fillOpacity={0.5} pathOptions={{ color: '#0284c7', fillColor: '#0284c7' }}>
                  <Popup><b>{w.ward}</b><br />Registrations: {w.count}</Popup>
                  <LTip>{w.ward}: {w.count}</LTip>
                </CircleMarker>
              ))}
            </MapContainer>
          </CardContent></Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Coverage by Ward</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[440px] overflow-y-auto">
                {byWard.sort((a, b) => b.count - a.count).map((w) => (
                  <div key={w.ward} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between"><span className="text-sm text-slate-700">{w.ward}</span><span className="text-sm font-bold">{w.count}</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{ width: `${(w.count / maxCount) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}