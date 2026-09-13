import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, UserPlus, Users, MessageSquare, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCurrentUser } from '@/lib/auth-role';
import { queueLength } from '@/lib/offline';
import { useEffect, useState } from 'react';

const navItems = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/new', label: 'Register', icon: UserPlus },
  { to: '/app/registrations', label: 'People', icon: Users },
  { to: '/app/messages', label: 'Messages', icon: MessageSquare },
  { to: '/app/profile', label: 'Profile', icon: UserIcon },
];

export default function AgentLayout() {
  const { user } = useAuth();
  const { user: me } = useCurrentUser();
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pending, setPending] = useState(queueLength());
  const location = useLocation();

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  useEffect(() => { setPending(queueLength()); }, [location]);

  const name = me?.full_name || user?.email || 'Agent';

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col max-w-md mx-auto bg-white">
      {/* Top header — DCP branding */}
      <header className="sticky top-0 z-20 bg-[#008F4C] text-white px-4 py-3 flex items-center gap-3 safe-top select-none">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold leading-tight">DCP</h1>
          <p className="text-[11px] text-white/80 leading-tight">Democracy for the Citizens</p>
        </div>
        <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${online ? 'bg-white/20' : 'bg-amber-500/40'}`}>
          {online ? 'Online' : `${pending} Pending`}
        </span>
        <NavLink to="/app/notifications" className="relative p-1.5">
          <Bell className="w-5 h-5 text-white" />
        </NavLink>
        <NavLink to="/app/profile" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm shrink-0">
          {name.charAt(0).toUpperCase()}
        </NavLink>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-16 overscroll-y-none">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-[#E9EDEF] grid grid-cols-5 z-20 safe-bottom select-none">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 gap-1 text-[11px] font-medium select-none transition-colors ${isActive ? 'text-[#008F4C]' : 'text-[#667781]'}`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}