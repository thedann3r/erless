import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
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
