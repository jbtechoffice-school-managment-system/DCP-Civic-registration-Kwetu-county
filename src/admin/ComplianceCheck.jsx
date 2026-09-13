import { useEffect, useState, useMemo } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { CheckCircle2, XCircle, AlertCircle, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { logAudit } from '@/lib/audit';

const CHECKS = [
  { key: 'first_name', label: 'First name present' },
  { key: 'surname', label: 'Surname present' },
  { key: 'county', label: 'County specified' },
  { key: 'constituency', label: 'Constituency specified' },
  { key: 'ward', label: 'Ward specified' },
  { key: 'community', label: 'Community specified' },
  { key: 'contact_number', label: 'Contact number provided' },
  { key: 'consent_given', label: 'Consent given' },
  { key: 'id_number', label: 'ID number provided' },
  { key: 'gender', label: 'Gender recorded' },
];

export default function ComplianceCheck() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const all = await supabaseApi.entities.Registration.list('-created_date', 200);
        setRecords(all);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const evaluated = useMemo(() => {
    return records.map((r) => {
      const results = CHECKS.map((c) => ({
        ...c,
        pass: c.key === 'consent_given' ? r[c.key] === true : !!(r[c.key] && String(r[c.key]).trim()),
      }));
      const passed = results.filter((c) => c.pass).length;
      const score = Math.round((passed / CHECKS.length) * 100);
      return { record: r, results, passed, total: CHECKS.length, score };
    });
  }, [records]);

  const filtered = filter === 'compliant' ? evaluated.filter((e) => e.score === 100)
    : filter === 'noncompliant' ? evaluated.filter((e) => e.score < 100)
    : evaluated;

  const approveCompliant = async (e) => {
    await supabaseApi.entities.Registration.update(e.record.id, { verification_status: 'verified', status: 'verified' });
    await logAudit('compliance_approved', e.record.id, `${e.record.first_name} ${e.record.surname} — ${e.score}% compliant`);
    toast({ title: 'Marked compliant & verified' });
    setRecords((prev) => prev.map((r) => r.id === e.record.id ? { ...r, verification_status: 'verified' } : r));
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-slate-700" />Compliance Checklist</h1>
        <p className="text-sm text-slate-500">Verify registration records meet data quality standards before final processing.</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Records</SelectItem>
            <SelectItem value="compliant">Fully Compliant</SelectItem>
            <SelectItem value="noncompliant">Non-Compliant</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-slate-500">{filtered.length} records</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <Card key={e.record.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{e.record.first_name} {e.record.surname}</p>
                    <p className="text-xs text-slate-500">{e.record.ward}, {e.record.county}</p>
                  </div>
                  <span className={`text-sm font-bold ${e.score === 100 ? 'text-green-600' : e.score >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                    {e.score}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {e.results.map((c) => (
                    <div key={c.key} className="flex items-center gap-1.5 text-xs">
                      {c.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                      <span className={c.pass ? 'text-slate-600' : 'text-red-500'}>{c.label}</span>
                    </div>
                  ))}
                </div>
                {e.score === 100 ? (
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => approveCompliant(e)}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Approve & Verify
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Missing {e.total - e.passed} field(s) — needs completion before approval.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}