import { useState, useEffect } from "react";
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
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Redirect if already logged in (using useEffect to avoid setState during render)
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    
    const formData = new FormData(e.currentTarget);
    const emailOrUsername = formData.get("emailOrUsername") as string;
    const password = formData.get("password") as string;
    
    try {
      await login(emailOrUsername, password);
      // Redirect is handled by auth hook based on user role
    } catch (error) {
      const errorMessage = "Invalid email/username or password. Please try again.";
      setLoginError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
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
      // Registration functionality - redirect to enhanced signup flow
      setLocation("/signup");
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
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <ErllessedLogo className="mx-auto h-20 w-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Welcome to Erlessed</h2>
            <p className="mt-2 text-sm text-gray-600">Outdoing an Undoable</p>
          </div>

          <Card className="w-full border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Access Your Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to manage healthcare claims and patient data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="text-sm font-medium">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-sm font-medium">
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {loginError}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="emailOrUsername" className="text-sm font-medium text-gray-700">
                        Email or Username
                      </Label>
                      <Input
                        id="emailOrUsername"
                        name="emailOrUsername"
                        type="text"
                        autoComplete="username"
                        required
                        placeholder="Enter your email or username"
                        className="medical-form-input"
                      />
                      <p className="text-xs text-gray-500">
                        You can login with either your email address or username
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="Enter your password"
                        className="medical-form-input"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full teal-button"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-teal-50 border border-teal-200 rounded-lg">
                      <h3 className="text-lg font-semibold text-teal-800 mb-2">
                        Professional Registration
                      </h3>
                      <p className="text-sm text-teal-700 mb-4">
                        Join Erlessed with our comprehensive onboarding process designed for healthcare professionals
                      </p>
                      <Button 
                        onClick={() => setLocation("/signup")}
                        className="w-full teal-button"
                      >
                        Start Professional Registration
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-600">
                      <p>✓ Automatic care provider detection</p>
                      <p>✓ Professional license verification</p>
                      <p>✓ Role-based dashboard access</p>
                      <p>✓ Kenya regulatory compliance</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">Secure healthcare claims management platform</p>
            <p className="text-xs text-gray-400 mt-1">Powered by Aboolean.</p>
          </div>
        </div>
      </div>
      {/* Right Panel - Features Overview */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-teal-600 to-blue-700 text-white p-12 items-center justify-center">
        <div className="max-w-lg">
          <h3 className="text-3xl font-bold mb-8">
            Comprehensive Healthcare Management
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-lg">AI-Powered Claims Processing</h4>
                <p className="text-teal-100 text-sm">
                  Intelligent preauthorization with real-time decision making
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Multi-Role Dashboards</h4>
                <p className="text-teal-100 text-sm">
                  Specialized interfaces for doctors, pharmacists, and administrators
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Regulatory Compliance</h4>
                <p className="text-teal-100 text-sm">
                  Full compliance with Kenyan healthcare regulations and data protection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}