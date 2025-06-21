import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, SessionTimeoutWarning } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import PatientVerification from "@/pages/patient-verification";
import ClaimsProcessing from "@/pages/claims-processing";
import AIPreauth from "@/pages/ai-preauth";
import Pharmacy from "@/pages/pharmacy";
import CareManager from "@/pages/care-manager";
import Blockchain from "@/pages/blockchain";
import Debtors from "@/pages/debtors";
import PatientQueue from "@/pages/patient-queue";
import ConsultationForm from "@/pages/consultation-form";
import EnhancedAuthPage from "@/pages/enhanced-auth-page";
import DoctorDashboard from "@/pages/doctor-dashboard";
import PharmacyDashboard from "@/pages/pharmacy-dashboard";
import CareManagerDashboard from "@/pages/care-manager-dashboard";
import InsurerDashboard from "@/pages/insurer-dashboard";
import PatientDashboard from "@/pages/patient-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import DemoDashboard from "@/pages/demo-dashboard";
import AnalyticsPage from "@/pages/analytics-page";
import HMSIntegrationPage from "@/pages/hms-integration";
import OnboardingPage from "@/pages/onboarding-page";
import ModernAuthPage from "@/pages/modern-auth-page";
import ModernDoctorDashboard from "@/pages/modern-doctor-dashboard";
import ModernPharmacyDashboard from "@/pages/modern-pharmacy-dashboard";
import ModernCareManagerDashboard from "@/pages/modern-care-manager-dashboard";
import ModernInsurerDashboard from "@/pages/modern-insurer-dashboard";
import ModernPatientDashboard from "@/pages/modern-patient-dashboard";
import ModernAdminDashboard from "@/pages/modern-admin-dashboard";
import ModernFrontOfficeDashboard from "@/pages/modern-front-office-dashboard";
import OnboardingManagement from "@/pages/onboarding-management";
import SupportDashboard from "@/pages/support-dashboard";
import MobileFieldWorker from "@/pages/mobile-field-worker";
import MobilePatientPortal from "@/pages/mobile-patient-portal";
import EnhancedSignup from "@/pages/enhanced-signup";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/verification" component={PatientVerification} />
      <ProtectedRoute path="/claims" component={ClaimsProcessing} />
      <ProtectedRoute path="/ai-preauth" component={AIPreauth} />
      <ProtectedRoute path="/pharmacy" component={Pharmacy} />
      <ProtectedRoute path="/care-manager" component={CareManager} />
      <ProtectedRoute path="/blockchain" component={Blockchain} />
      <ProtectedRoute path="/debtors" component={Debtors} />
      <ProtectedRoute path="/patient-queue" component={PatientQueue} />
      <ProtectedRoute path="/consultation" component={ConsultationForm} />
      
      {/* New Role-Based Dashboards */}
      <ProtectedRoute path="/doctor" component={DoctorDashboard} />
      <ProtectedRoute path="/pharmacy-dashboard" component={PharmacyDashboard} />
      <ProtectedRoute path="/care-manager-dashboard" component={CareManagerDashboard} />
      <ProtectedRoute path="/insurer" component={InsurerDashboard} />
      <ProtectedRoute path="/patient" component={PatientDashboard} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/hms-integration" component={HMSIntegrationPage} />
      <ProtectedRoute path="/onboarding-management" component={OnboardingManagement} />
      <ProtectedRoute path="/support-dashboard" component={SupportDashboard} />
      
      {/* Mobile Applications */}
      <ProtectedRoute path="/mobile-field-worker" component={MobileFieldWorker} />
      <ProtectedRoute path="/mobile-patient-portal" component={MobilePatientPortal} />
      
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/demo" component={DemoDashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/modern-auth" component={ModernAuthPage} />
      <Route path="/signup" component={EnhancedSignup} />
      <Route path="/secure-auth" component={EnhancedAuthPage} />
      
      {/* Modern Dashboard Routes */}
      <ProtectedRoute path="/modern-doctor" component={ModernDoctorDashboard} />
      <ProtectedRoute path="/modern-pharmacy" component={ModernPharmacyDashboard} />
      <ProtectedRoute path="/modern-care-manager" component={ModernCareManagerDashboard} />
      <ProtectedRoute path="/modern-insurer" component={ModernInsurerDashboard} />
      <ProtectedRoute path="/modern-patient" component={ModernPatientDashboard} />
      <ProtectedRoute path="/modern-admin" component={ModernAdminDashboard} />
      <ProtectedRoute path="/modern-front-office" component={ModernFrontOfficeDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <SessionTimeoutWarning />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
