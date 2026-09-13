import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { ArrowLeft, CheckCircle2, Flag, XCircle } from 'lucide-react';
import { logAudit } from '@/lib/audit';
import { useToast } from '@/ui/use-toast';

export default function RegistrationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [record, setRecord] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await supabaseApi.entities.Registration.get(id);
      setRecord(r);
      try {
        const logs = await supabaseApi.entities.AuditLog.filter({ record_id: id }, 'created_date', 50);
        setAudit(logs);
      } catch {}
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const setVerification = async (status) => {
    const statusMap = { verified: 'verified', flagged: 'pending', unverified: 'pending' };
    await supabaseApi.entities.Registration.update(record.id, {
      verification_status: status,
      status: statusMap[status] || record.status,
    });
    await logAudit(`registration_${status}`, record.id, `${record.first_name} ${record.surname}`);
    toast({ title: `Marked ${status}` });
    load();
  };

  if (loading) return <div className="p-6"><p className="text-sm text-slate-400">Loading…</p></div>;
  if (!record) return <div className="p-6"><p className="text-sm text-slate-400">Registration not found.</p><Button variant="link" onClick={() => navigate('/admin/registrations')}>Back to list</Button></div>;

  const fields = [
    ['First name', record.first_name],
    ['Surname', record.surname],
    ['Last name', record.last_name],
    ['Contact number', record.contact_number],
    ['Date of birth', record.date_of_birth],
    ['Age category', record.age_category],
    ['Gender', record.gender],
    ['County', record.county],
    ['Constituency', record.constituency],
    ['Ward', record.ward],
    ['Community', record.community],
    ['Station', record.station],
    ['Status', record.status],
    ['Verification status', record.verification_status],
    ['Consent given', record.consent_given ? 'Yes' : 'No'],
    ['Notes', record.notes],
    ['Submitted by', record.created_by],
    ['Created', record.created_date],
    ['Updated', record.updated_date],
    ['ID', record.id],
  ];

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{record.first_name} {record.surname}</h1>
          <p className="text-sm text-slate-500">{record.ward}, {record.county}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${record.verification_status === 'verified' ? 'bg-green-100 text-green-700' : record.verification_status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
          {record.verification_status}
        </span>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-green-600" onClick={() => setVerification('verified')}><CheckCircle2 className="w-4 h-4 mr-1" />Verify</Button>
        <Button size="sm" variant="outline" className="text-red-600" onClick={() => setVerification('flagged')}><Flag className="w-4 h-4 mr-1" />Flag</Button>
        <Button size="sm" variant="outline" onClick={() => setVerification('unverified')}><XCircle className="w-4 h-4 mr-1" />Reset</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">All Fields</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {fields.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-medium text-slate-900 break-words">{value || '—'}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Audit Timeline</CardTitle></CardHeader>
        <CardContent>
          {audit.length === 0 ? (
            <p className="text-sm text-slate-400">No audit events recorded.</p>
          ) : (
            <div className="border-l-2 border-slate-200 pl-3 space-y-2">
              {audit.map((a) => (
                <div key={a.id} className="text-xs">
                  <p className="font-medium text-slate-900">{a.action.replace(/_/g, ' ')}</p>
                  <p className="text-slate-500">{a.actor_email} · {a.created_date}</p>
                  {a.details && <p className="text-slate-400">{a.details}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}