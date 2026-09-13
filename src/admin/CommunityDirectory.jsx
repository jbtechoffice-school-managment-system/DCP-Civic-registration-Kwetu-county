import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Button } from '@/ui/button';
import { MapPin, Search, Plus } from 'lucide-react';
import { COUNTIES, constituenciesFor, wardsFor, communitiesFor } from '@/lib/geo';

export default function CommunityDirectory() {
  const [county, setCounty] = useState('');
  const [constituency, setConstituency] = useState('');
  const [ward, setWard] = useState('');
  const [search, setSearch] = useState('');

  const constituencies = useMemo(() => county ? constituenciesFor(county) : [], [county]);
  const wards = useMemo(() => county && constituency ? wardsFor(county, constituency) : [], [county, constituency]);
  const communities = useMemo(() => county && constituency && ward ? communitiesFor(county, constituency, ward) : [], [county, constituency, ward]);

  const filteredCounties = COUNTIES.filter((c) => !search || c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-slate-700" />Community Directory</h1>
        <p className="text-sm text-slate-500">Browse and manage wards, constituencies, and communities available to field agents.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">County</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search counties…" className="pl-9 text-sm" />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredCounties.map((c) => (
                <button key={c} onClick={() => { setCounty(c); setConstituency(''); setWard(''); }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${county === c ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                  {c}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Constituencies {county && `· ${county}`}</CardTitle></CardHeader>
          <CardContent>
            {constituencies.length === 0 ? (
              <p className="text-sm text-slate-400">Select a county first.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {constituencies.map((c) => (
                  <button key={c} onClick={() => { setConstituency(c); setWard(''); }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${constituency === c ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Wards & Communities</CardTitle></CardHeader>
          <CardContent>
            {wards.length === 0 ? (
              <p className="text-sm text-slate-400">Select a constituency first.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {wards.map((w) => (
                  <div key={w}>
                    <button onClick={() => setWard(w === ward ? '' : w)}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium ${ward === w ? 'bg-sky-100 text-sky-700' : 'hover:bg-slate-100 text-slate-700'}`}>
                        {w}
                      </button>
                    {ward === w && communities.length > 0 && (
                      <div className="ml-3 mt-1 space-y-1 border-l-2 border-slate-200 pl-2">
                        {communities.map((cm) => (
                          <p key={cm} className="text-xs text-slate-500 py-0.5">{cm}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}