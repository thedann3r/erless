import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ErllessedLogo } from "@/components/erlessed-logo";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Stethoscope, Shield, Heart, Activity, Users, Building2,
  User, Lock, Mail, ArrowRight, CheckCircle, AlertCircle
} from "lucide-react";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ModernAuthPage() {
  const [, setLocation] = useLocation();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const roleRedirects = {
        doctor: "/modern-doctor",
        pharmacist: "/modern-pharmacy",
        "care-manager": "/care-manager-dashboard",
        insurer: "/insurer",
        patient: "/patient",
        admin: "/admin"
      };
      setLocation(roleRedirects[user.role as keyof typeof roleRedirects] || "/dashboard");
    }
  }, [user, setLocation]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError("");

    try {
      await login(data.identifier, data.password);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to Erlessed",
      });
    } catch (error) {
      setLoginError("Invalid credentials. Please check your email/username and password.");
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Stethoscope className="h-6 w-6 text-primary" />,
      title: "Clinical Excellence",
      description: "Advanced decision support tools for healthcare providers"
    },
    {
      icon: <Shield className="h-6 w-6 text-[#265651]" />,
      title: "Secure Claims Processing",
      description: "End-to-end encryption and compliance with healthcare standards"
    },
    {
      icon: <Activity className="h-6 w-6 text-green-600" />,
      title: "Real-time Analytics",
      description: "Instant insights into patient care and financial performance"
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Multi-role Access",
      description: "Tailored dashboards for every healthcare role"
    }
  ];

  const quickLoginOptions = [
    { role: "Doctor", credentials: "testuser / test123", icon: <Stethoscope className="h-4 w-4" /> },
    { role: "Pharmacist", credentials: "pharmacy@knh.or.ke", icon: <Heart className="h-4 w-4" /> },
    { role: "Care Manager", credentials: "manager@aku.edu", icon: <Users className="h-4 w-4" /> },
    { role: "Patient", credentials: "patient@gmail.com", icon: <User className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6BBDB4]/10 via-white to-[#265651]/10">
      <div className="container mx-auto flex min-h-screen">
        {/* Left Panel - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12">
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-4">
              <ErllessedLogo className="h-16 w-auto mx-auto" />
              <h1 className="text-4xl font-bold text-gray-900">
                Healthcare Claims Platform
              </h1>
              <p className="text-lg text-gray-600">
                Streamlining healthcare delivery with intelligent claims processing,
                real-time verification, and comprehensive analytics.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2 bg-white rounded-xl shadow-sm">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t">
              <p className="text-sm text-gray-500 text-center">
                Trusted by healthcare providers across Kenya
              </p>
              <div className="flex items-center justify-center space-x-6 mt-4">
                <Building2 className="h-8 w-8 text-gray-300" />
                <Heart className="h-8 w-8 text-gray-300" />
                <Shield className="h-8 w-8 text-gray-300" />
                <Activity className="h-8 w-8 text-gray-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <ErllessedLogo className="h-12 w-auto mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-600">Sign in to your healthcare dashboard</p>
            </div>

            {/* Login Card */}
            <Card className="border-0 shadow-2xl">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Email or Username</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter email or username"
                              className="h-12"
                              autoComplete="username"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Lock className="h-4 w-4" />
                            <span>Password</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter password"
                              className="h-12"
                              autoComplete="current-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {loginError && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Sign In</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Demo Access</span>
                  </div>
                </div>

                {/* Quick Login Options */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center">Quick access for testing:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickLoginOptions.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-auto p-3 flex flex-col items-center space-y-1"
                        onClick={() => {
                          const [username] = option.credentials.split(" / ");
                          form.setValue("identifier", username);
                          form.setValue("password", "test123");
                        }}
                      >
                        {option.icon}
                        <span className="text-xs">{option.role}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/signup">
                      <a className="text-primary hover:underline font-medium">
                        Sign up here
                      </a>
                    </Link>
                  </p>
                  <p className="text-xs text-gray-500">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Support Information */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Need help? Contact support at{" "}
                <a href="mailto:support@erlessed.com" className="text-primary hover:underline">
                  support@erlessed.com
                </a>
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Secure • HIPAA Compliant • 99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}