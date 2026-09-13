import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from "@/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import HomeRedirect from '@/components/HomeRedirect';
import AgentLayout from '@/components/AgentLayout';
import AdminLayout from '@/components/AdminLayout';
import AgentHome from '@/agent/AgentHome';
import NewRegistration from '@/agent/NewRegistration';
import MyRegistrations from '@/agent/MyRegistrations';
import AgentMessages from '@/agent/AgentMessages';
import AgentNotifications from '@/agent/AgentNotifications';
import AgentProfile from '@/agent/AgentProfile';
import AdminDashboard from '@/admin/AdminDashboard';
import AdminAgents from '@/admin/AdminAgents';
import AdminRegistrations from '@/admin/AdminRegistrations';
import AdminMap from '@/admin/AdminMap';
import AdminMessages from '@/admin/AdminMessages';
import AdminNotifications from '@/admin/AdminNotifications';
import AdminReports from '@/admin/AdminReports';
import AdminAuditLogs from '@/admin/AdminAuditLogs';
import AdminSettings from '@/admin/AdminSettings';
import RegistrationSummary from '@/admin/RegistrationSummary';
import AgentPerformance from '@/admin/AgentPerformance';
import AgentLeaderboard from '@/admin/AgentLeaderboard';
import AgentSchedule from '@/admin/AgentSchedule';
import UnreviewedRegistrations from '@/admin/UnreviewedRegistrations';
import RegistrationStatistics from '@/admin/RegistrationStatistics';
import RegistrationDetails from '@/admin/RegistrationDetails';
import FieldSessionLog from '@/admin/FieldSessionLog';
import BroadcastNotices from '@/admin/BroadcastNotices';
import DataExport from '@/admin/DataExport';
import RegistrationMap from '@/admin/RegistrationMap';
import AgentDirectory from '@/admin/AgentDirectory';
import RegistrationAnalytics from '@/admin/RegistrationAnalytics';
import HelpCenter from '@/pages/HelpCenter';
import SystemStatus from '@/pages/SystemStatus';
import FieldResources from '@/agent/FieldResources';
import FieldGuidelines from '@/agent/FieldGuidelines';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/lib/i18n';
import SystemUsageGuide from '@/guide/SystemUsageGuide';
import SupportPortal from '@/pages/SupportPortal';
import CommunityAnalytics from '@/admin/CommunityAnalytics';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import AgentOnboarding from '@/admin/AgentOnboarding';
import DataIntegrityAudit from '@/admin/DataIntegrityAudit';
import AreaCoverageMap from '@/admin/AreaCoverageMap';
import ConfigurationSettings from '@/admin/ConfigurationSettings';
import RegistrationArchive from '@/admin/RegistrationArchive';
import FieldSessionMap from '@/admin/FieldSessionMap';
import NotificationTemplates from '@/admin/NotificationTemplates';
import RegistrationStatusHistory from '@/admin/RegistrationStatusHistory';
import AdminImport from '@/admin/AdminImport';
import NeedsReview from '@/admin/NeedsReview';
import DataImportHub from '@/admin/DataImportHub';
import AgentInsights from '@/admin/AgentInsights';
import SecurityAudit from '@/admin/SecurityAudit';
import CommunityDirectory from '@/admin/CommunityDirectory';
import TrainingMaterials from '@/agent/TrainingMaterials';
import AgentFeedback from '@/agent/AgentFeedback';
import ActivityStream from '@/admin/ActivityStream';
import ComplianceCheck from '@/admin/ComplianceCheck';
import ResourceLibrary from '@/agent/ResourceLibrary';
import OperationalAlerts from '@/admin/OperationalAlerts';
import DataIntegrityLogs from '@/admin/DataIntegrityLogs';
import RegistrationHeatmap from '@/admin/RegistrationHeatmap';
import SupportTickets from '@/admin/SupportTickets';
import SyncConflicts from '@/admin/SyncConflicts';
import ContentLibrary from '@/admin/ContentLibrary';
import GeoZones from '@/admin/GeoZones';
import SystemAlerts from '@/admin/SystemAlerts';
import VerificationQueue from '@/admin/VerificationQueue';
import QuickTraining from '@/agent/QuickTraining';
import FieldCalendar from '@/agent/FieldCalendar';
import DailySummary from '@/admin/DailySummary';
import RegionalAnalytics from '@/admin/RegionalAnalytics';
import SystemHelp from '@/pages/SystemHelp';
import AttendanceTracker from '@/admin/AttendanceTracker';
import TrainingHub from '@/pages/TrainingHub';
import DeviceManagement from '@/admin/DeviceManagement';
import UserInvitations from '@/admin/UserInvitations';
import CommunityNewsFeed from '@/pages/CommunityNewsFeed';
import DataIntegrityCheck from '@/admin/DataIntegrityCheck';
import FieldSafetyCheckin from '@/pages/FieldSafetyCheckin';
import BroadcastMessages from '@/admin/BroadcastMessages';

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

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
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