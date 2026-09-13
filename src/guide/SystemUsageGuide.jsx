import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { BookOpen, Play, MapPin, ClipboardCheck, Wifi, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';
import { ArrowLeft } from 'lucide-react';

const sections = [
  { icon: BookOpen, title: 'Getting Started', body: 'Log in with your credentials. You will see your agent reference and phone number at the top. These are assigned by the administrator and cannot be changed.' },
  { icon: ClipboardCheck, title: 'Creating a Registration', body: 'Tap "New Community Registration" from the home screen. Fill in personal details, select County → Constituency → Ward → Community. If your community is not listed, select "Others" and type the name. Check the consent box, then tap Save (green) or Reject (red) to clear the form.' },
  { icon: Play, title: 'Managing Field Sessions', body: 'Go to Profile → Field Location Sharing → Start Field Session. Your approximate location is shared during authorized field work. You can pause, resume, or stop the session at any time.' },
  { icon: Wifi, title: 'Working Offline', body: 'If you lose internet, registrations are saved locally on your device. They will automatically sync when you reconnect. Check System Status to see your sync health.' },
  { icon: MapPin, title: 'Viewing Your Records', body: 'Tap "My Records" to see all your submissions. Use the status badges to track which records are verified, pending, or flagged.' },
  { icon: Shield, title: 'Data Privacy', body: 'Only you and authorized supervisors can see your registrations. Always obtain consent before collecting data. Never share community member details with unauthorized persons.' },
];

export default function SystemUsageGuide() {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Usage Guide</h1>
        <p className="text-sm text-slate-500">A simple guide for field agents on using the app, managing sessions, and handling registrations.</p>
      </div>
      {sections.map((s) => (
        <Card key={s.title}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center shrink-0"><s.icon className="w-5 h-5 text-sky-600" /></div>
              <div><p className="text-sm font-semibold text-slate-900 mb-1">{s.title}</p><p className="text-sm text-slate-600">{s.body}</p></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}