import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { BookOpen, ClipboardList, MapPin, Play, Square, MessageSquare, HelpCircle, ArrowLeft, Video } from 'lucide-react';

export default function QuickTraining() {
  const guides = [
    {
      icon: ClipboardList,
      title: 'Creating a Registration',
      steps: [
        'Tap "New Registration" from the home screen.',
        'Fill in the person\'s first name, surname, and ID number.',
        'Select county, constituency, ward, and community from the dropdowns.',
        'Mark consent and tap "Submit Registration".',
        'If offline, the record is saved locally and will sync automatically when you reconnect.',
      ],
    },
    {
      icon: MapPin,
      title: 'Starting a Field Session',
      steps: [
        'On the home screen, tap "Start Field Session".',
        'Grant location permission when prompted.',
        'Your approximate location is shared only during the active session.',
        'Tap "Pause" to temporarily halt or "Stop" to end the session.',
      ],
    },
    {
      icon: MessageSquare,
      title: 'Messaging Admin',
      steps: [
        'Tap the "Messages" tab in the bottom navigation.',
        'Select an existing conversation or wait for an admin to start one.',
        'Type your message and tap send. You can also attach photos or record voice notes.',
      ],
    },
    {
      icon: HelpCircle,
      title: 'Getting Support',
      steps: [
        'If you encounter a technical issue, contact your supervisor via Messages.',
        'Check the Help Center for FAQs and troubleshooting tips.',
        'For account issues, ask an admin to reset your password or update your profile.',
      ],
    },
  ];

  return (
    <div className="p-4 space-y-4 select-none">
      <div className="flex items-center gap-2">
        <Link to="/app" className="p-1.5 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Quick Training Guide</h1>
      </div>

      <Card className="bg-sky-50 border-sky-200">
        <CardContent className="p-4 flex items-center gap-3">
          <Video className="w-8 h-8 text-sky-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-900">New to the app?</p>
            <p className="text-xs text-slate-600">Follow the quick-start guides below to get going in minutes.</p>
          </div>
        </CardContent>
      </Card>

      {guides.map((g, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <g.icon className="w-4 h-4 text-sky-600" />
              {g.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {g.steps.map((step, j) => (
                <li key={j} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">{j + 1}</span>
                  <span className="text-sm text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ))}

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">Need more help? Contact your supervisor or visit the Help Center.</p>
      </div>
    </div>
  );
}