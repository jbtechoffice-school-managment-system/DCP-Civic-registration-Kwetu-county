import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { ClipboardCheck, Shield, Phone, AlertTriangle } from 'lucide-react';

const protocols = [
  'Verify the individual\'s identity before recording their details.',
  'Always obtain explicit verbal or written consent before collecting data.',
  'Record accurate location information (county, constituency, ward, community).',
  'Double-check all names and ID numbers for accuracy before saving.',
  'Do not share registration data with unauthorized persons.',
];

const privacyRules = [
  'Only collect data that is necessary for the registration purpose.',
  'Store devices securely when not in use to prevent unauthorized access.',
  'Never share community member contact details with third parties.',
  'Report any data breaches immediately to your supervisor.',
  'Delete any unofficial copies of registration data after syncing.',
];

const emergencyContacts = [
  { label: 'Supervisor Hotline', number: '+254 700 000 000' },
  { label: 'Admin Support', number: '+254 700 000 001' },
  { label: 'Emergency Services', number: '999 / 112' },
  { label: 'Data Protection Officer', number: '+254 700 000 002' },
];

export default function FieldGuidelines() {
  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-lg font-bold text-slate-900">Field Guidelines</h1>
      <p className="text-sm text-slate-500">Quick-reference documentation on registration protocols, data privacy, and emergency contacts.</p>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-sky-600" /> Registration Protocols</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {protocols.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-green-600" /> Data Privacy</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {privacyRules.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-red-600" /> Emergency Contacts</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {emergencyContacts.map((c) => (
              <div key={c.label} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                <span className="text-sm font-medium text-slate-700">{c.label}</span>
                <span className="text-sm font-mono font-semibold text-slate-900">{c.number}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800">If you encounter any issues in the field that put you or community members at risk, contact your supervisor immediately and move to a safe location.</p>
      </div>
    </div>
  );
}