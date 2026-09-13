import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';

// Approximate coordinates for Kasarani constituency wards
const WARD_COORDS = {
  'Kasarani': { lat: -1.2186, lng: 36.8888 },
  'Njiru': { lat: -1.2267, lng: 36.9056 },
  'Ruai': { lat: -1.2517, lng: 36.9183 },
  'Mwiki': { lat: -1.2097, lng: 36.8903 },
  'Clay City': { lat: -1.2247, lng: 36.8897 },
  'Mihango': { lat: -1.2317, lng: 36.9117 },
  'Saika': { lat: -1.2383, lng: 36.9050 },
};

export default function RegistrationMap() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCounty, setFilterCounty] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await supabaseApi.entities.Registration.list('-created_date', 500);
        setRegs(data);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const filtered = filterCounty ? regs.filter((r) => r.county === filterCounty) : regs;

  // Group by ward
  const byWard = {};
  filtered.forEach((r) => {
    const w = r.ward || 'Unknown';
    if (!byWard[w]) byWard[w] = { count: 0, verified: 0, pending: 0 };
    byWard[w].count++;
    if (r.verification_status === 'verified') byWard[w].verified++;
    else byWard[w].pending++;
  });

  const markers = Object.entries(byWard).map(([ward, stats]) => {
    const coords = WARD_COORDS[ward] || { lat: -1.22, lng: 36.89 };
    return { ward, ...coords, ...stats };
  });

  const maxCount = Math.max(...markers.map((m) => m.count), 1);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registration Map</h1>
          <p className="text-sm text-slate-500">Geographic distribution of submitted registrations by ward.</p>
        </div>
        <Select value={filterCounty} onValueChange={setFilterCounty}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All counties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All counties</SelectItem>
            <SelectItem value="Nairobi">Nairobi</SelectItem>
            <SelectItem value="Kiambu">Kiambu</SelectItem>
            <SelectItem value="Mombasa">Mombasa</SelectItem>
            <SelectItem value="Kisumu">Kisumu</SelectItem>
            <SelectItem value="Nakuru">Nakuru</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading map…</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardContent className="p-0">
              <MapContainer center={[-1.22, 36.89]} zoom={12} style={{ height: '500px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                {markers.map((m) => (
                  <CircleMarker
                    key={m.ward}
                    center={[m.lat, m.lng]}
                    radius={10 + (m.count / maxCount) * 25}
                    fillOpacity={0.5}
                    color="#0284c7"
                    fillColor="#0284c7"
                  >
                    <Popup>
                      <strong>{m.ward}</strong><br />
                      Total: {m.count}<br />
                      Verified: {m.verified}<br />
                      Pending: {m.pending}
                    </Popup>
                    <Tooltip>{m.ward}: {m.count}</Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Ward Summary</CardTitle></CardHeader>
            <CardContent>
              {markers.length === 0 ? (
                <p className="text-sm text-slate-400">No registrations yet.</p>
              ) : (
                <div className="space-y-2">
                  {markers.sort((a, b) => b.count - a.count).map((m) => (
                    <div key={m.ward} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{m.ward}</span>
                      <span className="font-semibold text-slate-900">{m.count}</span>
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