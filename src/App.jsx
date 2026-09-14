import ErrorBoundary from '@/components/ErrorBoundary';
import { lazyPage } from '@/lib/lazyPage';
import { Toaster } from "@/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
const PageNotFound = lazyPage(() => import('./lib/PageNotFound'));
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
const Login = lazyPage(() => import('./pages/Login'));
const Register = lazyPage(() => import('./pages/Register'));
const ForgotPassword = lazyPage(() => import('./pages/ForgotPassword'));
const ResetPassword = lazyPage(() => import('./pages/ResetPassword'));
import HomeRedirect from '@/components/HomeRedirect';
import AgentLayout from '@/components/AgentLayout';
import AdminLayout from '@/components/AdminLayout';
const AgentHome = lazyPage(() => import('./agent/AgentHome'));
const NewRegistration = lazyPage(() => import('./agent/NewRegistration'));
const MyRegistrations = lazyPage(() => import('./agent/MyRegistrations'));
const AgentMessages = lazyPage(() => import('./agent/AgentMessages'));
const AgentNotifications = lazyPage(() => import('./agent/AgentNotifications'));
const AgentProfile = lazyPage(() => import('./agent/AgentProfile'));
const AdminDashboard = lazyPage(() => import('./admin/AdminDashboard'));
const AdminAgents = lazyPage(() => import('./admin/AdminAgents'));
const AdminRegistrations = lazyPage(() => import('./admin/AdminRegistrations'));
const AdminMap = lazyPage(() => import('./admin/AdminMap'));
const AdminMessages = lazyPage(() => import('./admin/AdminMessages'));
const AdminNotifications = lazyPage(() => import('./admin/AdminNotifications'));
const AdminReports = lazyPage(() => import('./admin/AdminReports'));
const AdminAuditLogs = lazyPage(() => import('./admin/AdminAuditLogs'));
const AdminSettings = lazyPage(() => import('./admin/AdminSettings'));
const RegistrationSummary = lazyPage(() => import('./admin/RegistrationSummary'));
const AgentPerformance = lazyPage(() => import('./admin/AgentPerformance'));
const AgentLeaderboard = lazyPage(() => import('./admin/AgentLeaderboard'));
const AgentSchedule = lazyPage(() => import('./admin/AgentSchedule'));
const UnreviewedRegistrations = lazyPage(() => import('./admin/UnreviewedRegistrations'));
const RegistrationStatistics = lazyPage(() => import('./admin/RegistrationStatistics'));
const RegistrationDetails = lazyPage(() => import('./admin/RegistrationDetails'));
const FieldSessionLog = lazyPage(() => import('./admin/FieldSessionLog'));
const BroadcastNotices = lazyPage(() => import('./admin/BroadcastNotices'));
const DataExport = lazyPage(() => import('./admin/DataExport'));
const RegistrationMap = lazyPage(() => import('./admin/RegistrationMap'));
const AgentDirectory = lazyPage(() => import('./admin/AgentDirectory'));
const RegistrationAnalytics = lazyPage(() => import('./admin/RegistrationAnalytics'));
const HelpCenter = lazyPage(() => import('./pages/HelpCenter'));
const SystemStatus = lazyPage(() => import('./pages/SystemStatus'));
const FieldResources = lazyPage(() => import('./agent/FieldResources'));
const FieldGuidelines = lazyPage(() => import('./agent/FieldGuidelines'));
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/lib/i18n';
const SystemUsageGuide = lazyPage(() => import('./guide/SystemUsageGuide'));
const SupportPortal = lazyPage(() => import('./pages/SupportPortal'));
const CommunityAnalytics = lazyPage(() => import('./admin/CommunityAnalytics'));
const PrivacyPolicy = lazyPage(() => import('./pages/PrivacyPolicy'));
const AgentOnboarding = lazyPage(() => import('./admin/AgentOnboarding'));
const DataIntegrityAudit = lazyPage(() => import('./admin/DataIntegrityAudit'));
const AreaCoverageMap = lazyPage(() => import('./admin/AreaCoverageMap'));
const ConfigurationSettings = lazyPage(() => import('./admin/ConfigurationSettings'));
const RegistrationArchive = lazyPage(() => import('./admin/RegistrationArchive'));
const FieldSessionMap = lazyPage(() => import('./admin/FieldSessionMap'));
const NotificationTemplates = lazyPage(() => import('./admin/NotificationTemplates'));
const RegistrationStatusHistory = lazyPage(() => import('./admin/RegistrationStatusHistory'));
const AdminImport = lazyPage(() => import('./admin/AdminImport'));
const NeedsReview = lazyPage(() => import('./admin/NeedsReview'));
const DataImportHub = lazyPage(() => import('./admin/DataImportHub'));
const AgentInsights = lazyPage(() => import('./admin/AgentInsights'));
const SecurityAudit = lazyPage(() => import('./admin/SecurityAudit'));
const CommunityDirectory = lazyPage(() => import('./admin/CommunityDirectory'));
const TrainingMaterials = lazyPage(() => import('./agent/TrainingMaterials'));
const AgentFeedback = lazyPage(() => import('./agent/AgentFeedback'));
const ActivityStream = lazyPage(() => import('./admin/ActivityStream'));
const ComplianceCheck = lazyPage(() => import('./admin/ComplianceCheck'));
const ResourceLibrary = lazyPage(() => import('./agent/ResourceLibrary'));
const OperationalAlerts = lazyPage(() => import('./admin/OperationalAlerts'));
const DataIntegrityLogs = lazyPage(() => import('./admin/DataIntegrityLogs'));
const RegistrationHeatmap = lazyPage(() => import('./admin/RegistrationHeatmap'));
const SupportTickets = lazyPage(() => import('./admin/SupportTickets'));
const SyncConflicts = lazyPage(() => import('./admin/SyncConflicts'));
const ContentLibrary = lazyPage(() => import('./admin/ContentLibrary'));
const GeoZones = lazyPage(() => import('./admin/GeoZones'));
const SystemAlerts = lazyPage(() => import('./admin/SystemAlerts'));
const VerificationQueue = lazyPage(() => import('./admin/VerificationQueue'));
const QuickTraining = lazyPage(() => import('./agent/QuickTraining'));
const FieldCalendar = lazyPage(() => import('./agent/FieldCalendar'));
const DailySummary = lazyPage(() => import('./admin/DailySummary'));
const RegionalAnalytics = lazyPage(() => import('./admin/RegionalAnalytics'));
const SystemHelp = lazyPage(() => import('./pages/SystemHelp'));
const AttendanceTracker = lazyPage(() => import('./admin/AttendanceTracker'));
const TrainingHub = lazyPage(() => import('./pages/TrainingHub'));
const DeviceManagement = lazyPage(() => import('./admin/DeviceManagement'));
const UserInvitations = lazyPage(() => import('./admin/UserInvitations'));
const CommunityNewsFeed = lazyPage(() => import('./pages/CommunityNewsFeed'));
const DataIntegrityCheck = lazyPage(() => import('./admin/DataIntegrityCheck'));
const FieldSafetyCheckin = lazyPage(() => import('./pages/FieldSafetyCheckin'));
const BroadcastMessages = lazyPage(() => import('./admin/BroadcastMessages'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Public authentication pages must remain accessible
  // even when there is no authenticated Supabase session.
  const publicAuthPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];

  const currentPath = window.location.pathname;
  const isPublicAuthPath = publicAuthPaths.includes(currentPath);

  // Authentication errors for protected areas should redirect to login.
  // Never redirect when the user is already on a public auth page.
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }

    if (authError.type === 'auth_required' && !isPublicAuthPath) {
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/app" element={<AgentLayout />}>
          <Route index element={<AgentHome />} />
          <Route path="new" element={<NewRegistration />} />
          <Route path="registrations" element={<MyRegistrations />} />
          <Route path="messages" element={<AgentMessages />} />
          <Route path="notifications" element={<AgentNotifications />} />
          <Route path="profile" element={<AgentProfile />} />
          <Route path="field-resources" element={<FieldResources />} />
          <Route path="field-guidelines" element={<FieldGuidelines />} />
          <Route path="training-materials" element={<TrainingMaterials />} />
          <Route path="feedback" element={<AgentFeedback />} />
          <Route path="resources" element={<ResourceLibrary />} />
          <Route path="training" element={<QuickTraining />} />
          <Route path="field-calendar" element={<FieldCalendar />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="registrations" element={<AdminRegistrations />} />
          <Route path="map" element={<AdminMap />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="summary" element={<RegistrationSummary />} />
          <Route path="agent-performance" element={<AgentPerformance />} />
          <Route path="leaderboard" element={<AgentLeaderboard />} />
          <Route path="agent-schedule" element={<AgentSchedule />} />
          <Route path="unreviewed" element={<UnreviewedRegistrations />} />
          <Route path="statistics" element={<RegistrationStatistics />} />
          <Route path="registration-details/:id" element={<RegistrationDetails />} />
          <Route path="session-history" element={<FieldSessionLog />} />
          <Route path="broadcast" element={<BroadcastNotices />} />
          <Route path="export-data" element={<DataExport />} />
          <Route path="data-export" element={<DataExport />} />
          <Route path="registration-map" element={<RegistrationMap />} />
          <Route path="agent-directory" element={<AgentDirectory />} />
          <Route path="registration-analytics" element={<RegistrationAnalytics />} />
          <Route path="registration-summary" element={<RegistrationSummary />} />
          <Route path="community-analytics" element={<CommunityAnalytics />} />
          <Route path="onboarding" element={<AgentOnboarding />} />
          <Route path="data-integrity" element={<DataIntegrityAudit />} />
          <Route path="coverage-map" element={<AreaCoverageMap />} />
          <Route path="config" element={<ConfigurationSettings />} />
          <Route path="archive" element={<RegistrationArchive />} />
          <Route path="session-map" element={<FieldSessionMap />} />
          <Route path="templates" element={<NotificationTemplates />} />
          <Route path="registration-history" element={<RegistrationStatusHistory />} />
          <Route path="import" element={<AdminImport />} />
          <Route path="data-import" element={<DataImportHub />} />
          <Route path="agent-insights" element={<AgentInsights />} />
          <Route path="security-audit" element={<SecurityAudit />} />
          <Route path="community-directory" element={<CommunityDirectory />} />
          <Route path="activity-stream" element={<ActivityStream />} />
          <Route path="compliance-check" element={<ComplianceCheck />} />
          <Route path="alerts" element={<OperationalAlerts />} />
          <Route path="integrity-logs" element={<DataIntegrityLogs />} />
          <Route path="registration-heatmap" element={<RegistrationHeatmap />} />
          <Route path="support-tickets" element={<SupportTickets />} />
          <Route path="sync-conflicts" element={<SyncConflicts />} />
          <Route path="content-library" element={<ContentLibrary />} />
          <Route path="geo-zones" element={<GeoZones />} />
          <Route path="system-alerts" element={<SystemAlerts />} />
          <Route path="verification-queue" element={<VerificationQueue />} />
          <Route path="daily-summary" element={<DailySummary />} />
          <Route path="regional-insights" element={<RegionalAnalytics />} />
          <Route path="attendance" element={<AttendanceTracker />} />
          <Route path="devices" element={<DeviceManagement />} />
          <Route path="invitations" element={<UserInvitations />} />
          <Route path="integrity-check" element={<DataIntegrityCheck />} />
          <Route path="broadcast-messages" element={<BroadcastMessages />} />
          <Route path="needs-review" element={<NeedsReview />} />
          <Route path="audit" element={<AdminAuditLogs />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/system-status" element={<SystemStatus />} />
        <Route path="/guide" element={<SystemUsageGuide />} />
        <Route path="/support" element={<SupportPortal />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/help" element={<SystemHelp />} />
        <Route path="/training-hub" element={<TrainingHub />} />
        <Route path="/community-updates" element={<CommunityNewsFeed />} />
        <Route path="/safety-checkin" element={<FieldSafetyCheckin />} />
        <Route path="/registration-details/:id" element={<RegistrationDetails />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <LanguageProvider>
        <AuthProvider>
          <ErrorBoundary>
            <QueryClientProvider client={queryClientInstance}>
              <Router>
                <ScrollToTop />
                <AuthenticatedApp />
              </Router>
              <Toaster />
            </QueryClientProvider>
          </ErrorBoundary>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App

