import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { AlertTriangle, Copy, CheckCircle2, FileWarning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DataIntegrityAudit() {
  const navigate = useNavigate();
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setRegs(await supabaseApi.entities.Registration.list('-created_date', 1000)); } catch {} finally { setLoading(false); }
    })();
  }, []);

  const issues = useMemo(() => {
    const duplicates = [];
    const missing = [];
    const seen = {};
    regs.forEach((r) => {
      const key = `${r.first_name?.toLowerCase()}_${r.surname?.toLowerCase()}_${r.ward}`;
      if (seen[key]) duplicates.push({ ...r, duplicate_of: seen[key] });
      else seen[key] = r.id;
      if (!r.id_number || !r.contact_number || !r.date_of_birth) missing.push(r);
    });
    return { duplicates, missing };
  }, [regs]);

  return (
    <div className="p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Data Integrity Audit</h1>
        <p className="text-sm text-slate-500">Identifies potential duplicate registrations and entries missing critical field data.</p>
      </div>
      {loading ? <p className="text-sm text-slate-400">Loading…</p> : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><Copy className="w-5 h-5 text-red-600" /></div><div><p className="text-[11px] uppercase text-slate-500">Potential Duplicates</p><p className="text-2xl font-bold text-red-600">{issues.duplicates.length}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><FileWarning className="w-5 h-5 text-amber-600" /></div><div><p className="text-[11px] uppercase text-slate-500">Missing Critical Data</p><p className="text-2xl font-bold text-amber-600">{issues.missing.length}</p></div></CardContent></Card>
          </div>

          {issues.duplicates.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-600" /> Potential Duplicates ({issues.duplicates.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {issues.duplicates.map((r) => (
                    <div key={r.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                      <p className="text-sm font-medium text-slate-900">{r.first_name} {r.surname}</p>
                      <p className="text-xs text-slate-500">{r.ward}, {r.county} · {r.created_date?.slice(0, 10)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {issues.missing.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileWarning className="w-4 h-4 text-amber-600" /> Missing Critical Data ({issues.missing.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {issues.missing.map((r) => (
                    <div key={r.id} className="border border-amber-200 rounded-lg p-3 bg-amber-50">
                      <p className="text-sm font-medium text-slate-900">{r.first_name} {r.surname}</p>
                      <p className="text-xs text-slate-500">{r.ward}, {r.county}</p>
                      <div className="flex gap-1 mt-1">
                        {!r.id_number && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">No ID</span>}
                        {!r.contact_number && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">No Phone</span>}
                        {!r.date_of_birth && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">No DOB</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {issues.duplicates.length === 0 && issues.missing.length === 0 && (
            <Card><CardContent className="p-8 text-center"><CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" /><p className="text-sm text-slate-600">All records pass integrity checks. No issues found.</p></CardContent></Card>
          )}
        </>
      )}
    </div>
  );
}