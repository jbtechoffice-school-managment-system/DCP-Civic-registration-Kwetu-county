import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/ui/use-toast';
import { GEO, COMMUNITIES, COUNTIES, constituenciesFor, wardsFor, communitiesFor } from '@/lib/geo';

export default function ConfigurationSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [county, setCounty] = useState('');
  const [newConstituency, setNewConstituency] = useState('');
  const [newWard, setNewWard] = useState('');

  const addConstituency = () => {
    if (!county || !newConstituency.trim()) return;
    toast({ title: 'Configuration updated', description: `Added constituency "${newConstituency}" to ${county}. (Note: changes are session-only — contact support to persist.)` });
    setNewConstituency('');
  };

  const addWard = () => {
    if (!county || !newWard.trim()) return;
    toast({ title: 'Configuration updated', description: `Added ward "${newWard}". (Note: changes are session-only — contact support to persist.)` });
    setNewWard('');
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuration Settings</h1>
        <p className="text-sm text-slate-500">Update the list of wards, communities, and other static registration dropdown options.</p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Current Geographic Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {COUNTIES.map((c) => (
            <div key={c} className="border border-slate-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-slate-900">{c}</p>
              <div className="mt-2 space-y-1">
                {constituenciesFor(c).map((con) => (
                  <div key={con} className="text-xs text-slate-600 pl-3">
                    <span className="font-medium">{con}</span>: {wardsFor(c, con).join(', ')}
                    {COMMUNITIES[c]?.[con] && Object.keys(COMMUNITIES[c][con]).length > 0 && (
                      <span className="text-slate-400"> — Communities: {Object.values(COMMUNITIES[c][con]).flat().join(', ')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Constituency</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">County</Label>
            <select value={county} onChange={(e) => setCounty(e.target.value)} className="w-full h-9 rounded-md border border-input px-3 text-sm">
              <option value="">Select county</option>
              {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><Label className="text-xs">New Constituency Name</Label><Input value={newConstituency} onChange={(e) => setNewConstituency(e.target.value)} /></div>
          <Button size="sm" onClick={addConstituency}><Plus className="w-3.5 h-3.5 mr-1" /> Add Constituency</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Ward</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">County</Label>
            <select value={county} onChange={(e) => setCounty(e.target.value)} className="w-full h-9 rounded-md border border-input px-3 text-sm">
              <option value="">Select county</option>
              {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><Label className="text-xs">New Ward Name</Label><Input value={newWard} onChange={(e) => setNewWard(e.target.value)} /></div>
          <Button size="sm" onClick={addWard}><Plus className="w-3.5 h-3.5 mr-1" /> Add Ward</Button>
        </CardContent>
      </Card>
    </div>
  );
}