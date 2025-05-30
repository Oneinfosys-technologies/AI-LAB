import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import BookTest from "@/pages/book-test";
import TestDetail from "@/pages/test-detail";
import MyReports from "@/pages/my-reports";
import ReportView from "@/pages/report-view";
import ReportDownload from "@/pages/report-download";
import AdminDashboard from "@/pages/admin/dashboard";
import TestManagement from "@/pages/admin/test-management";
import ProfilePage from "@/pages/profile-page";
import SuperAdminLogin from "@/pages/sa-login";
import SuperAdminDashboard from "@/pages/sa-dashboard";
import HealthChat from "@/pages/health-chat";
import HealthInsights from "@/pages/health-insights";
import ReportingPage from "@/pages/admin/reporting";
import ReportPrintPage from "@/pages/report-print";
import AdminTestResultEntryPage from "@/pages/admin/test-result-entry";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/sa-login" component={SuperAdminLogin} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/book-test" component={BookTest} />
      <ProtectedRoute path="/test/:id" component={TestDetail} />
      <ProtectedRoute path="/my-reports" component={MyReports} />
      <ProtectedRoute path="/reports/:id" component={ReportView} />
      <Route path="/reports/download/:reportId" component={ReportDownload} />
      <ProtectedRoute path="/health-chat" component={HealthChat} />
      <ProtectedRoute path="/health-insights" component={HealthInsights} />
      <ProtectedRoute path="/admin" component={AdminDashboard} roles={["admin", "superadmin"]} />
      <ProtectedRoute path="/admin/tests" component={TestManagement} roles={["admin", "superadmin"]} />
      <ProtectedRoute path="/admin/reporting" component={ReportingPage} roles={["admin", "superadmin"]} />
      <ProtectedRoute path="/admin/test-result-entry" component={AdminTestResultEntryPage} roles={["admin", "superadmin"]} />
      <ProtectedRoute path="/sa-dashboard" component={SuperAdminDashboard} roles={["superadmin"]} />
      <Route path="/report-print/:reportId" component={ReportPrintPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
