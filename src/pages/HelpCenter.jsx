import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { HelpCircle, BookOpen, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';

const faqs = [
  { q: 'How do I create a new registration?', a: 'Tap "New Registration" from the home screen, fill in the personal and location details, ensure consent is checked, then tap Save.' },
  { q: 'What happens when I am offline?', a: 'Your registrations are saved locally on your device. They will automatically sync to the server when you reconnect to the internet.' },
  { q: 'How do I start a field location session?', a: 'Go to your Profile, scroll to Field Location Sharing, and tap "Start Field Session". Remember to stop it when done.' },
  { q: 'Can I edit a registration after saving?', a: 'You can view your registrations under "My Registrations". Contact your supervisor or admin if a saved record needs correction.' },
  { q: 'What is the agent reference number?', a: 'Your agent reference is a unique identifier assigned by the administrator. It cannot be changed — contact admin if you need it updated.' },
  { q: 'How do I change my password?', a: 'Go to Profile and tap "Change Password". You will be guided through the password reset process.' },
];

const guides = [
  { title: 'Getting Started', desc: 'Learn the basics of navigating the app and creating your first registration.' },
  { title: 'Offline Mode', desc: 'Understand how offline data collection works and when syncing happens.' },
  { title: 'Field Sessions', desc: 'How to start, pause, and stop location sharing during field work.' },
  { title: 'Data Privacy', desc: 'Best practices for handling community member data responsibly.' },
];

export default function HelpCenter() {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Help Center</h1>
        <p className="text-sm text-slate-500">FAQs and usage guides to assist field agents with common operational questions.</p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><HelpCircle className="w-4 h-4 text-sky-600" /> Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-sky-600" /> Usage Guides</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {guides.map((g) => (
              <div key={g.title} className="border border-slate-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-slate-900">{g.title}</p>
                <p className="text-xs text-slate-500 mt-1">{g.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-sky-600" /> Need More Help?</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Contact your supervisor or administrator for additional support. For technical issues, reach out to DiploTech Africa / TechGov Africa support.</p>
        </CardContent>
      </Card>
    </div>
  );
}