import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { GraduationCap, FileText, Video, BookOpen, Lightbulb, Users, Shield, ClipboardCheck } from 'lucide-react';

const TRAINING_MODULES = [
  { title: 'Getting Started Guide', desc: 'Learn the basics of CivicFlow — account setup, navigation, and your first registration.', type: 'PDF Guide', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Registration Best Practices', desc: 'Step-by-step techniques for accurate, efficient field registrations.', type: 'PDF Guide', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
  { title: 'Using the Mobile App', desc: 'Video walkthrough of the agent mobile interface, offline mode, and sync.', type: 'Video Tutorial', icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
  { title: 'Data Quality Standards', desc: 'How to avoid duplicates, verify identity, and ensure data integrity.', type: 'PDF Guide', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Field Safety Protocols', desc: 'Safety guidelines and emergency contacts for field operations.', type: 'PDF Guide', icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
  { title: 'Community Engagement Tips', desc: 'Best practices for approaching community members and building trust.', type: 'Video Tutorial', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
  { title: 'Consent & Privacy', desc: 'Understanding consent requirements and data privacy obligations.', type: 'PDF Guide', icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: 'Handling Difficult Cases', desc: 'What to do when registrations are rejected or flagged for review.', type: 'Video Tutorial', icon: Lightbulb, color: 'text-orange-600', bg: 'bg-orange-50' },
];

export default function TrainingMaterials() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-sky-600" />Training Hub</h1>
        <p className="text-sm text-slate-500">Access guides, tutorials, and best practices to improve your registration technique.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TRAINING_MODULES.map((m) => (
          <Card key={m.title}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center shrink-0`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 text-sm">{m.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] font-medium text-slate-400">{m.type}</span>
                  <Button size="sm" variant="outline">Open</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}