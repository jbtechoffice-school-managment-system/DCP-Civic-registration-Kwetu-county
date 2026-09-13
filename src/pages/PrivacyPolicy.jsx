import { Card, CardContent } from '@/ui/card';
import { Shield, Database, Lock, Eye, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';
import { ArrowLeft } from 'lucide-react';

const sections = [
  { icon: Database, title: 'Data Collection', body: 'We collect only the information necessary for community registration: name, ID number, contact details, date of birth, gender, and location data (county, constituency, ward, community). All data collection requires explicit consent from the individual.' },
  { icon: Lock, title: 'Data Storage', body: 'All data is stored securely on encrypted servers. Access is restricted through role-based permissions. Only the agent who collected the data and authorized administrators can view registration records.' },
  { icon: Eye, title: 'Data Access', body: 'Field agents can only access their own collected registrations. Supervisors and administrators have broader access for oversight and verification purposes. All access is logged in an audit trail.' },
  { icon: Shield, title: 'Data Protection', body: 'We comply with applicable data protection laws. Personal data is never shared with third parties without explicit consent. Data is used solely for the purpose of community registration and outreach coordination.' },
  { icon: Download, title: 'Data Export', body: 'Administrators can export registration data for reporting purposes. Exported data must be handled with the same level of security as the live system.' },
  { icon: Trash2, title: 'Data Retention', body: 'Registration data is retained for the duration of the outreach program. Records can be archived or permanently deleted by administrators when no longer needed.' },
  { icon: AlertTriangle, title: 'Data Breach Response', body: 'In the event of a suspected data breach, all affected individuals will be notified promptly. Field agents must report any suspected breaches to their supervisor immediately.' },
];

export default function DataPrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Data Privacy Policy</h1>
        <p className="text-sm text-slate-500">How collected community data is stored, handled, and protected to ensure compliance and trust.</p>
      </div>
      {sections.map((s) => (
        <Card key={s.title}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0"><s.icon className="w-5 h-5 text-green-600" /></div>
              <div><p className="text-sm font-semibold text-slate-900 mb-1">{s.title}</p><p className="text-sm text-slate-600">{s.body}</p></div>
            </div>
          </CardContent>
        </Card>
      ))}
      <p className="text-xs text-slate-400 text-center">DiploTech Africa · TechGov Africa — This policy is reviewed and updated regularly.</p>
    </div>
  );
}