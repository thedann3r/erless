import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import PatientVerification from "@/pages/patient-verification";
import ClaimsProcessing from "@/pages/claims-processing";
import AIPreauthorization from "@/pages/ai-preauthorization";
import PharmacyValidation from "@/pages/pharmacy-validation";
import CareManager from "@/pages/care-manager";
import BlockchainAnchor from "@/pages/blockchain-anchor";
import DebtorsModule from "@/pages/debtors-module";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/verification" component={PatientVerification} />
      <ProtectedRoute path="/claims" component={ClaimsProcessing} />
      <ProtectedRoute path="/preauth" component={AIPreauthorization} />
      <ProtectedRoute path="/pharmacy" component={PharmacyValidation} />
      <ProtectedRoute path="/care-manager" component={CareManager} />
      <ProtectedRoute path="/blockchain" component={BlockchainAnchor} />
      <ProtectedRoute path="/debtors" component={DebtorsModule} />
      <Route path="/auth" component={AuthPage} />
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
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
