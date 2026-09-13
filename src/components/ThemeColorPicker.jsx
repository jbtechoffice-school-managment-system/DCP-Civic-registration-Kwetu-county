import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Palette, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCurrentUser } from '@/lib/auth-role';
import { useToast } from '@/ui/use-toast';

const THEMES = [
  { name: 'Slate', primary: '0 0% 9%', accent: '0 0% 9%' },
  { name: 'Ocean Blue', primary: '210 80% 50%', accent: '210 80% 50%' },
  { name: 'Forest Green', primary: '142 71% 45%', accent: '142 71% 45%' },
  { name: 'Royal Purple', primary: '265 85% 60%', accent: '265 85% 60%' },
  { name: 'Sunset Orange', primary: '25 95% 53%', accent: '25 95% 53%' },
  { name: 'Crimson Red', primary: '0 72% 51%', accent: '0 72% 51%' },
  { name: 'Teal', primary: '173 80% 40%', accent: '173 80% 40%' },
  { name: 'Pink Rose', primary: '330 80% 60%', accent: '330 80% 60%' },
  { name: 'Indigo', primary: '243 75% 59%', accent: '243 75% 59%' },
  { name: 'Amber Gold', primary: '38 92% 50%', accent: '38 92% 50%' },
];

export default function ThemeColorPicker() {
  const { user } = useAuth();
  const { user: me } = useCurrentUser();
  const { toast } = useToast();
  const [selected, setSelected] = useState(() => {
    try { return localStorage.getItem('civic-theme-color') || 'Slate'; } catch { return 'Slate'; }
  });

  const apply = (theme) => {
    setSelected(theme.name);
    try { localStorage.setItem('civic-theme-color', theme.name); } catch {}
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    toast({ title: `${theme.name} theme applied` });
  };

  useEffect(() => {
    const t = THEMES.find((t) => t.name === selected);
    if (t) {
      const root = document.documentElement;
      root.style.setProperty('--primary', t.primary);
      root.style.setProperty('--ring', t.primary);
    }
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Palette className="w-4 h-4 text-sky-600" /> Theme Colors</CardTitle></CardHeader>
      <CardContent>
        <p className="text-xs text-slate-500 mb-3">Choose from 10 beautiful theme colors to personalize your experience.</p>
        <div className="grid grid-cols-5 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.name}
              onClick={() => apply(t)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${selected === t.name ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                style={{ background: `hsl(${t.primary})` }}
              >
                {selected === t.name && <Check className="w-5 h-5 text-white" />}
              </div>
              <span className="text-[9px] text-slate-600 text-center leading-tight">{t.name}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}