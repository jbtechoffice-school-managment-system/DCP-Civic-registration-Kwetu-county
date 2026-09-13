import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Library, FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';

const RESOURCES = [
  { title: 'Official Registration Brochure', desc: 'Printable brochure with registration process overview for community distribution.', type: 'PDF', size: '2.4 MB', icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
  { title: 'Field Agent Flyer', desc: 'Promotional flyer for community outreach events.', type: 'PDF', size: '1.8 MB', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Step-by-Step Registration Guide', desc: 'Visual guide showing the complete registration workflow.', type: 'PDF', size: '3.2 MB', icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
  { title: 'Community Poster', desc: 'Awareness poster for community registration drives.', type: 'Image', size: '5.1 MB', icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  { title: 'Agent Quick Reference Card', desc: 'Laminated card with key fields and emergency contacts.', type: 'PDF', size: '0.8 MB', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Data Privacy Notice', desc: 'Official privacy notice for community members.', type: 'PDF', size: '1.2 MB', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

export default function ResourceLibrary() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Library className="w-5 h-5 text-sky-600" />Resource Library</h1>
        <p className="text-sm text-slate-500">Download official brochures, flyers, and documents for field outreach.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {RESOURCES.map((r) => (
          <Card key={r.title}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${r.bg} flex items-center justify-center shrink-0`}>
                <r.icon className={`w-5 h-5 ${r.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 text-sm">{r.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-400">{r.type} · {r.size}</span>
                  <Button size="sm" variant="outline">
                    <Download className="w-3.5 h-3.5 mr-1" />Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}