import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';

const PIN = '2027';
const SESSION_KEY = 'civic_admin_pin_ok';

export default function AdminPinLock({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === 'true'; } catch { return false; }
  });
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const unlock = () => {
    if (pin === PIN) {
      setUnlocked(true);
      try { sessionStorage.setItem(SESSION_KEY, 'true'); } catch {}
    } else {
      setError('Incorrect PIN. Access denied.');
      setPin('');
    }
  };

  if (unlocked) return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Access Locked</h1>
          <p className="text-sm text-slate-400 mt-1">Enter your PIN to access the admin panel</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 space-y-4">
          <Input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && unlock()}
            placeholder="Enter PIN"
            className="text-center text-lg tracking-widest bg-slate-700 border-slate-600 text-white"
            autoFocus
          />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <Button onClick={unlock} className="w-full bg-sky-600 hover:bg-sky-700">Unlock</Button>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-4">DiploTech Africa · TechGov Africa</p>
      </div>
    </div>
  );
}