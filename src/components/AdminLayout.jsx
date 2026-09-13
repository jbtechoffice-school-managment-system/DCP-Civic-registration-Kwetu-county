import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Map, MessageSquare, Bell, BarChart3, ScrollText, Settings, LogOut, Menu, X, ClipboardList, TrendingUp, Trophy, CalendarDays, AlertCircle, History, Megaphone, Download, PieChart, MapPin, BookOpen, Activity, HelpCircle, UserPlus, LifeBuoy, Shield, ChevronLeft, ChevronRight, UploadCloud, BarChart, ShieldCheck, MapPinned, Radio, ClipboardCheck, Siren, FolderOpen, Flame, Headphones, Smartphone } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCurrentUser } from '@/lib/auth-role';
import { useState } from 'react';
import ThemeLangToggle from '@/components/ThemeLangToggle';
import AdminPinLock from '@/components/AdminPinLock';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/summary', label: 'Summary', icon: ClipboardList },
  { to: '/admin/agents', label: 'Agents', icon: Users },
  { to: '/admin/agent-performance', label: 'Performance', icon: TrendingUp },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/admin/agent-schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/admin/registrations', label: 'Registrations', icon: FileText },
  { to: '/admin/unreviewed', label: 'Unreviewed', icon: AlertCircle },
  { to: '/admin/statistics', label: 'Statistics', icon: PieChart },
  { to: '/admin/map', label: 'Live Map', icon: Map },
  { to: '/admin/registration-map', label: 'Reg. Map', icon: MapPin },
  { to: '/admin/registration-analytics', label: 'Analytics', icon: Activity },
  { to: '/admin/community-analytics', label: 'Community Analytics', icon: PieChart },
  { to: '/admin/coverage-map', label: 'Coverage Map', icon: MapPin },
  { to: '/admin/session-map', label: 'Session Map', icon: Map },
  { to: '/admin/session-history', label: 'Session History', icon: History },
  { to: '/admin/agent-directory', label: 'Agent Directory', icon: BookOpen },
  { to: '/admin/onboarding', label: 'Onboarding', icon: UserPlus },
  { to: '/admin/data-integrity', label: 'Data Integrity', icon: AlertCircle },
  { to: '/admin/archive', label: 'Archive', icon: ScrollText },
  { to: '/admin/config', label: 'Config', icon: Settings },
  { to: '/admin/templates', label: 'Templates', icon: Megaphone },
  { to: '/admin/registration-history', label: 'Status History', icon: History },
  { to: '/admin/needs-review', label: 'Needs Review', icon: AlertCircle },
  { to: '/admin/import', label: 'Import Data', icon: Download },
  { to: '/admin/data-import', label: 'Data Import Hub', icon: UploadCloud },
  { to: '/admin/agent-insights', label: 'Agent Insights', icon: BarChart },
  { to: '/admin/security-audit', label: 'Security Audit', icon: ShieldCheck },
  { to: '/admin/community-directory', label: 'Community Directory', icon: MapPinned },
  { to: '/admin/activity-stream', label: 'Activity Stream', icon: Radio },
  { to: '/admin/compliance-check', label: 'Compliance Check', icon: ClipboardCheck },
  { to: '/admin/alerts', label: 'Operational Alerts', icon: Siren },
  { to: '/admin/integrity-logs', label: 'Integrity Logs', icon: ShieldCheck },
  { to: '/admin/registration-heatmap', label: 'Reg. Heatmap', icon: Flame },
  { to: '/admin/support-tickets', label: 'Support Tickets', icon: Headphones },
  { to: '/admin/sync-conflicts', label: 'Sync Conflicts', icon: AlertCircle },
  { to: '/admin/content-library', label: 'Content Library', icon: FolderOpen },
  { to: '/admin/geo-zones', label: 'Geo Zones', icon: MapPinned },
  { to: '/admin/system-alerts', label: 'System Alerts', icon: Siren },
  { to: '/admin/verification-queue', label: 'Verification Queue', icon: ClipboardCheck },
  { to: '/admin/daily-summary', label: 'Daily Summary', icon: FileText },
  { to: '/admin/regional-insights', label: 'Regional Analytics', icon: BarChart3 },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarDays },
  { to: '/admin/devices', label: 'Devices', icon: Smartphone },
  { to: '/admin/invitations', label: 'Invitations', icon: UserPlus },
  { to: '/admin/integrity-check', label: 'Integrity Check', icon: ShieldCheck },
  { to: '/admin/broadcast-messages', label: 'Broadcast', icon: Megaphone },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/export-data', label: 'Export Data', icon: Download },
  { to: '/admin/data-export', label: 'Data Export', icon: Download },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/help-center', label: 'Help Center', icon: HelpCircle },
  { to: '/guide', label: 'Usage Guide', icon: BookOpen },
  { to: '/support', label: 'Support Portal', icon: LifeBuoy },
  { to: '/privacy-policy', label: 'Privacy Policy', icon: Shield },
  { to: '/system-status', label: 'System Status', icon: Activity },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ onNavigate, collapsed }) {
  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'} ${collapsed ? 'justify-center' : ''}`
          }
        >
          <Icon className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="truncate">{label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { user: me } = useCurrentUser();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const roleLabel = (me?.role || user?.role || 'admin').toUpperCase();

  const doLogout = () => {
    logout(false);
    navigate('/login', { replace: true });
  };

  return (
    <AdminPinLock>
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#008F4C] text-white flex items-center justify-center text-xs font-bold shrink-0">CR</div>
          <span className="text-sm font-bold text-slate-900">Civic Field</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeLangToggle compact />
          <button onClick={() => setMobileOpen(true)} className="p-2"><Menu className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-bold">Menu</span>
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
            <div className="px-3 py-3 border-t border-slate-200">
              <button onClick={doLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" />Sign out</button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${collapsed ? 'w-[60px]' : 'w-[260px]'} shrink-0 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen transition-all duration-200`}>
        <div className={`px-3 py-4 border-b border-slate-200 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#008F4C] text-white flex items-center justify-center text-sm font-bold shrink-0">CR</div>
            {!collapsed && (
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">Civic Field</p>
                <p className="text-[11px] text-slate-500 leading-tight">Operational Command</p>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <SidebarContent collapsed={collapsed} />
        <div className="px-2 py-3 border-t border-slate-200">
          {!collapsed && <div className="px-1 pb-2"><ThemeLangToggle /></div>}
          <div className={`px-3 py-2 mb-1 ${collapsed ? 'hidden' : ''}`}>
            <p className="text-sm font-semibold text-slate-900 truncate">{me?.full_name || user?.email}</p>
            <p className="text-[11px] font-medium text-sky-600">{roleLabel}</p>
          </div>
          <button onClick={doLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 ${collapsed ? 'justify-center' : ''}`}>
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
          {!collapsed && <p className="text-[10px] text-slate-400 text-center mt-2">Civic Registration Flow</p>}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </div>
    </div>
    </AdminPinLock>
  );
}