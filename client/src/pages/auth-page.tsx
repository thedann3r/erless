import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ErllessedLogo } from "@/components/erlessed-logo";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
    try {
      await loginMutation.mutateAsync({ username, password });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    
    try {
      await registerMutation.mutateAsync({ username, password, email, name });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex">
      {/* Left Panel - Authentication Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <ErllessedLogo className="mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Erlessed</h1>
            <p className="text-gray-600">Healthcare Claims Processing Platform</p>
            <p className="text-sm text-gray-500">
              powered by <span className="font-semibold text-black">Aboolean</span>
            </p>
          </div>

          {/* Authentication Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your dashboard
                    </CardDescription>
                  </CardHeader>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        required
                        className="medical-form-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        className="medical-form-input"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full teal-button"
                      disabled={isLoading || loginMutation.isPending}
                    >
                      {isLoading || loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Register for a new healthcare provider account
                    </CardDescription>
                  </CardHeader>
                  
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        name="name"
                        type="text"
                        placeholder="Dr. Sarah Wilson"
                        required
                        className="medical-form-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email Address</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="sarah@hospital.com"
                        required
                        className="medical-form-input"
                      />
                      <p className="text-xs text-gray-500">
                        Role will be auto-detected from your email domain
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        name="username"
                        type="text"
                        placeholder="Choose a username"
                        required
                        className="medical-form-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="Create a secure password"
                        required
                        className="medical-form-input"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full teal-button"
                      disabled={isLoading || registerMutation.isPending}
                    >
                      {isLoading || registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Domain Role Detection Preview */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Automatic Role Detection
              </h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div><code className="bg-white px-1 rounded">@frontoffice.com</code> → Front Office</div>
                <div><code className="bg-white px-1 rounded">@doctor.com</code> → Physician</div>
                <div><code className="bg-white px-1 rounded">@lab.com</code> → Laboratory</div>
                <div><code className="bg-white px-1 rounded">@pharmacy.com</code> → Pharmacy</div>
                <div><code className="bg-white px-1 rounded">@care.com</code> → Care Manager</div>
                <div><code className="bg-white px-1 rounded">@billing.com</code> → Debtors</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-primary to-teal-secondary items-center justify-center p-12">
        <div className="text-center text-white space-y-6 max-w-md">
          <div className="w-16 h-16 mx-auto bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <i className="fas fa-shield-alt text-2xl text-white"></i>
          </div>
          
          <h2 className="text-3xl font-bold">
            Secure Healthcare Claims Processing
          </h2>
          
          <p className="text-teal-100 text-lg">
            AI-powered preauthorization, biometric patient verification, 
            and blockchain-secured claim anchoring for modern healthcare providers.
          </p>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <i className="fas fa-check-circle text-teal-200"></i>
              <span>Real-time AI decision making</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-check-circle text-teal-200"></i>
              <span>Biometric patient verification</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-check-circle text-teal-200"></i>
              <span>Blockchain claim anchoring</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-check-circle text-teal-200"></i>
              <span>Fraud pattern detection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
