import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { HelpCircle, ArrowLeft, ClipboardList, MapPin, MessageSquare, Bell, User, Phone, Mail } from 'lucide-react';

export default function SystemHelp() {
  const guides = [
    { icon: ClipboardList, title: 'Registering a Resident', body: 'Tap "Register" in the bottom navigation, fill in the resident\'s details, select their location, and tap "Register Resident". Required fields are marked with *.' },
    { icon: MapPin, title: 'Starting a Field Session', body: 'Go to your Profile and tap "Start Session". Your approximate location is shared only during the active session. Tap "Stop Session" when done.' },
    { icon: MessageSquare, title: 'Messaging Admin', body: 'Tap "Messages" in the bottom navigation to chat with your administrator. You can send text, photos, and voice notes.' },
    { icon: Bell, title: 'Notifications', body: 'Check the bell icon in the header for review updates, admin messages, and system announcements.' },
    { icon: User, title: 'Managing Your Profile', body: 'Update your name and operating area from the Profile screen. Contact an admin to change your phone number or agent reference.' },
  ];

  return (
    <div className="p-4 space-y-4 select-none">
      <div className="flex items-center gap-2">
        <Link to="/app" className="p-1.5 hover:bg-[#F0F2F5] rounded-full"><ArrowLeft className="w-5 h-5 text-[#111B21]" /></Link>
        <h1 className="text-lg font-bold text-[#111B21] flex items-center gap-2"><HelpCircle className="w-5 h-5 text-[#008F4C]" /> Help</h1>
      </div>

      <Card className="bg-[#D9FDD3] border-[#008F4C]/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-[#008F4C]">DCP Registration App</p>
          <p className="text-xs text-[#667781] mt-1">Democracy for the Citizens Party — Njiru Ward Registration. This guide will help you get started quickly.</p>
        </CardContent>
      </Card>

      {guides.map((g, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><g.icon className="w-4 h-4 text-[#008F4C]" /> {g.title}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-[#667781] leading-relaxed">{g.body}</p></CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Technical Support</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="tel:+254700000000" className="flex items-center gap-3 p-3 hover:bg-[#F0F2F5] rounded-xl">
            <Phone className="w-5 h-5 text-[#008F4C]" /><span className="text-sm text-[#111B21]">Call support</span>
          </a>
          <a href="mailto:jbtechadvanced@gmail.com" className="flex items-center gap-3 p-3 hover:bg-[#F0F2F5] rounded-xl">
            <Mail className="w-5 h-5 text-[#008F4C]" /><span className="text-sm text-[#111B21]">jbtechadvanced@gmail.com</span>
          </a>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-[#667781] pt-2">Developed by DiploTech Africa · TechGov Africa</p>
    </div>
  );
}