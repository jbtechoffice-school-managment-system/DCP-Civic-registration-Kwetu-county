import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Flame } from 'lucide-react';

const COUNTY_COORDS = {
  Nairobi: [-1.2864, 36.8172],
  Kiambu: [-1.1715, 36.8356],
  Mombasa: [-4.0435, 39.6682],
  Kisumu: [-0.0917, 34.7680],
  Nakuru: [-0.3031, 36.0800],
};

const WARD_COORDS = {
  Kasarani: [-1.218, 36.890],
  Njiru: [-1.236, 36.891],
  Ruai: [-1.230, 36.910],
  Mwiki: [-1.225, 36.875],
  'Clay City': [-1.215, 36.885],
  Mihango: [-1.215, 36.870],
  Saika: [-1.220, 36.880],
};

function densityColor(count) {
  if (count >= 20) return '#ef4444';
  if (count >= 10) return '#f59e0b';
  if (count >= 5) return '#eab308';
  return '#22c55e';
}

export default function RegistrationHeatmap() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('county');

  useEffect(() => {
    (async () => {
      try {
        const all = await supabaseApi.entities.Registration.list('-created_date', 1000);
        setRegs(all);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const countyData = useMemo(() => {
    const byCounty = {};
    regs.forEach((r) => { if (r.county) byCounty[r.county] = (byCounty[r.county] || 0) + 1; });
    return Object.entries(byCounty).map(([county, count]) => ({
      county, count, coords: COUNTY_COORDS[county] || [-0.5, 37.5],
    }));
  }, [regs]);

  const wardData = useMemo(() => {
    const byWard = {};
    regs.forEach((r) => { if (r.ward) byWard[r.ward] = (byWard[r.ward] || 0) + 1; });
    return Object.entries(byWard)
      .map(([ward, count]) => ({ ward, count, coords: WARD_COORDS[ward] || null }))
      .filter((d) => d.coords);
  }, [regs]);

  const markers = view === 'county' ? countyData : wardData;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Registration Heatmap
          </h1>
          <p className="text-sm text-slate-500">Density of registrations across counties and wards.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('county')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${view === 'county' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>By County</button>
          <button onClick={() => setView('ward')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${view === 'ward' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>By Ward</button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-sm text-slate-400 text-center">Loading map…</p>
          ) : (
            <MapContainer center={[-1.0, 37.5]} zoom={7} style={{ height: '500px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {markers.map((m, i) => (
                <CircleMarker
                  key={i}
                  center={m.coords}
                  radius={Math.max(8, Math.min(40, m.count * 2))}
                  pathOptions={{ color: densityColor(m.count), fillColor: densityColor(m.count), fillOpacity: 0.5 }}
                >
                  <Popup>
                    <strong>{m.county || m.ward}</strong><br />
                    {m.count} registrations
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...markers].sort((a, b) => b.count - a.count).map((m, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-3 bg-white flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">{m.county || m.ward}</p>
              <p className="text-xs text-slate-500">{m.count} registrations</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: densityColor(m.count) }}>
              {m.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}