import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { BookOpen, Users, FileQuestion, Shield, Download, HelpCircle, Activity, ClipboardCheck, ChevronRight, GraduationCap, MessageSquarePlus, Library } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const resources = [
  { title: 'Training Manual — Registration Process', desc: 'Complete guide on how to conduct community registrations step by step.', icon: BookOpen, type: 'PDF' },
  { title: 'Community Outreach Guidelines', desc: 'Best practices for engaging community members and building trust during field work.', icon: Users, type: 'PDF' },
  { title: 'Registration FAQs for Agents', desc: 'Quick answers to common questions agents face in the field.', icon: FileQuestion, type: 'Guide' },
  { title: 'Data Protection & Privacy Guide', desc: 'How to handle personal data responsibly and comply with data protection law.', icon: Shield, type: 'PDF' },
];

export default function FieldResources() {
  const navigate = useNavigate();
  const quickLinks = [
    { label: 'Field Guidelines', desc: 'Registration protocols & emergency contacts', icon: ClipboardCheck, to: '/app/field-guidelines' },
    { label: 'Help Center', desc: 'FAQs and usage guides', icon: HelpCircle, to: '/help-center' },
    { label: 'System Status', desc: 'Check sync health & connection', icon: Activity, to: '/system-status' },
    { label: 'Usage Guide', desc: 'How to use the app, manage sessions', icon: BookOpen, to: '/guide' },
    { label: 'Support Portal', desc: 'Submit technical issues to admin', icon: HelpCircle, to: '/support' },
    { label: 'Privacy Policy', desc: 'How your data is protected', icon: Shield, to: '/privacy-policy' },
    { label: 'Training Hub', desc: 'Video tutorials & best practice guides', icon: GraduationCap, to: '/app/training-materials' },
    { label: 'Feedback Portal', desc: 'Report challenges or suggest improvements', icon: MessageSquarePlus, to: '/app/feedback' },
    { label: 'Resource Library', desc: 'Download brochures, flyers & documents', icon: Library, to: '/app/resources' },
  ];

  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-lg font-bold text-slate-900">Field Resources</h1>
      <p className="text-sm text-slate-500">Access digital training manuals, outreach guidelines, and registration FAQs.</p>

      {/* Quick Links */}
      <div className="space-y-2">
        {quickLinks.map((l) => (
          <button key={l.to} onClick={() => navigate(l.to)} className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-left">
            <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
              <l.icon className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">{l.label}</p>
              <p className="text-xs text-slate-500">{l.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {resources.map((r) => (
          <Card key={r.title}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                  <r.icon className="w-5 h-5 text-sky-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{r.desc}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{r.type}</span>
                    <button className="text-xs text-sky-600 font-medium flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}