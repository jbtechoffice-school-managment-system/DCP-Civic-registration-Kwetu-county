import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { GEO, COUNTIES, constituenciesFor, wardsFor } from '@/lib/geo';
import { MapPinned, ChevronRight, ChevronDown } from 'lucide-react';

export default function GeoZones() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCounty, setExpandedCounty] = useState(null);
  const [expandedConstituency, setExpandedConstituency] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await supabaseApi.entities.Registration.list('-created_date', 1000);
        setRegs(all);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const countFor = (county, constituency, ward) => {
    return regs.filter((r) => {
      if (county && r.county !== county) return false;
      if (constituency && r.constituency !== constituency) return false;
      if (ward && r.ward !== ward) return false;
      return true;
    }).length;
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MapPinned className="w-5 h-5 text-slate-700" /> Geographic Zones
        </h1>
        <p className="text-sm text-slate-500">Administrative boundaries and active service areas for field teams.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Loading…</p>
      ) : (
        <div className="space-y-2">
          {COUNTIES.map((county) => {
            const countyCount = countFor(county);
            const countyActive = countyCount > 0;
            const isExpanded = expandedCounty === county;
            const constituencies = constituenciesFor(county);

            return (
              <Card key={county}>
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedCounty(isExpanded ? null : county)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <span className="text-sm font-semibold text-slate-900">{county}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${countyActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {countyActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{countyCount} registrations</span>
                  </button>

                  {isExpanded && (
                    <div className="pl-6 sm:pl-10 pb-2 space-y-1">
                      {constituencies.map((con) => {
                        const conCount = countFor(county, con);
                        const conActive = conCount > 0;
                        const conExpanded = expandedConstituency === con;
                        const wards = wardsFor(county, con);

                        return (
                          <div key={con}>
                            <button
                              onClick={() => setExpandedConstituency(conExpanded ? null : con)}
                              className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                {conExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                                <span className="text-sm text-slate-700">{con}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${conActive ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                  {conActive ? 'Active' : '—'}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500">{conCount}</span>
                            </button>

                            {conExpanded && (
                              <div className="pl-6 sm:pl-8 pb-1">
                                {wards.map((ward) => {
                                  const wardCount = countFor(county, con, ward);
                                  return (
                                    <div key={ward} className="flex items-center justify-between p-2 text-xs">
                                      <span className="text-slate-600">{ward}</span>
                                      <span className={`font-medium ${wardCount > 0 ? 'text-sky-600' : 'text-slate-400'}`}>{wardCount}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}