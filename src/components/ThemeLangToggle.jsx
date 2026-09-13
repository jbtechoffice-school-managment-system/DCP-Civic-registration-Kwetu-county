import { Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/ui/button';

export default function ThemeLangToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useI18n();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(lang === 'en' ? 'sw' : 'en');

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleLang} className="h-8 w-8" title="Language">
          <Globe className="w-4 h-4" />
          <span className="text-[10px] font-bold ml-0.5">{lang.toUpperCase()}</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8" title="Theme">
          <Sun className="w-4 h-4 dark:hidden" />
          <Moon className="w-4 h-4 hidden dark:block" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={toggleLang}>
        <Globe className="w-4 h-4 mr-1" />
        {lang === 'en' ? 'EN' : 'SW'}
      </Button>
      <Button variant="outline" size="sm" onClick={toggleTheme}>
        <Sun className="w-4 h-4 mr-1 dark:hidden" />
        <Moon className="w-4 h-4 hidden dark:block mr-1" />
        {theme === 'dark' ? 'Light' : 'Dark'}
      </Button>
    </div>
  );
}