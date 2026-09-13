import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';

export default function FieldSessionMap() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, u] = await Promise.all([
          supabaseApi.entities.LocationSession.list('-started_at', 200),
          supabaseApi.entities.User.list('-created_date', 200),
        ]);
        setSessions(s.filter((x) => x.status === 'stopped'));
        setAgents(u.filter((u) => u.role === 'field_agent'));
      } catch {}
    })();
  }, []);

  const agentName = (id) => agents.find((a) => a.id === id)?.full_name || 'Unknown';
  const filtered = selectedAgent ? sessions.filter((s) => s.agent_id === selectedAgent) : sessions;
  const points = filtered.filter((s) => s.last_lat != null && s.last_lng != null);

  return (
    <div className="p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Field Session Map</h1>
          <p className="text-sm text-slate-500">Historical movement and coverage routes of agents during completed field sessions.</p>
        </div>
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All agents" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All agents</SelectItem>
            {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name || a.email}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card><CardContent className="p-0">
        <MapContainer center={[-1.22, 36.89]} zoom={12} style={{ height: '500px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          {points.length > 1 && <Polyline positions={points.map((p) => [p.last_lat, p.last_lng])} pathOptions={{ color: '#0284c7', weight: 3, opacity: 0.6 }} />}
          {points.map((p, i) => (
            <CircleMarker key={p.id} center={[p.last_lat, p.last_lng]} radius={6} fillOpacity={0.7} pathOptions={{ color: i === 0 ? '#16a34a' : '#0284c7' }}>
              <Popup><b>{agentName(p.agent_id)}</b><br />Ward: {p.ward || '—'}<br />Started: {p.started_at?.slice(0, 16)}<br />Ended: {p.ended_at?.slice(0, 16) || '—'}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </CardContent></Card>
    </div>
  );
}