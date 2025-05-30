import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "front-office",
    },
  });

  // Redirect to dashboard if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  const roleOptions = [
    { value: "front-office", label: "Front Office" },
    { value: "doctor", label: "Doctor" },
    { value: "lab", label: "Lab Technician" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "debtors", label: "Debtors" },
    { value: "care-manager", label: "Care Manager" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-clinical-gray to-white flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and branding */}
          <div className="text-center">
            <Logo className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-teal-primary">Erlessed</h1>
            <p className="text-sm text-gray-600 mt-1">Healthcare Claims Processing Platform</p>
            <p className="text-xs text-gray-400 mt-1">
              powered by <span className="font-semibold text-gray-800">Aboolean</span>
            </p>
          </div>

          {/* Auth forms */}
          <Card className="border-gray-200 shadow-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="space-y-1 pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="login" className="space-y-0">
                <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        {...loginForm.register("username")}
                        disabled={loginMutation.isPending}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-600">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                        disabled={loginMutation.isPending}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-600">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    {loginMutation.error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          Invalid credentials. Please try again.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-teal-primary hover:bg-teal-dark"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-0">
                <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        {...registerForm.register("username")}
                        disabled={registerMutation.isPending}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-600">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="doctor@hospital.com"
                        {...registerForm.register("email")}
                        disabled={registerMutation.isPending}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-600">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        {...registerForm.register("password")}
                        disabled={registerMutation.isPending}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-600">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-role">Role</Label>
                      <select
                        id="register-role"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        {...registerForm.register("role")}
                        disabled={registerMutation.isPending}
                      >
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {registerForm.formState.errors.role && (
                        <p className="text-sm text-red-600">
                          {registerForm.formState.errors.role.message}
                        </p>
                      )}
                    </div>
                    {registerMutation.error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          Registration failed. Please try again.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-teal-primary hover:bg-teal-dark"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Domain detection info */}
          <Card className="bg-clinical-gray border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">
                Domain-based Role Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 text-gray-600">
              <div><code>@frontoffice.com</code> → Front Office</div>
              <div><code>@doctor.com</code> → Physician</div>
              <div><code>@lab.com</code> → Laboratory</div>
              <div><code>@pharmacy.com</code> → Pharmacy</div>
              <div><code>@debtors.com</code> → Debtors</div>
              <div><code>@manager.com</code> → Care Manager</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="flex-1 bg-gradient-to-br from-teal-primary to-teal-dark text-white p-8 flex items-center justify-center">
        <div className="max-w-lg text-center space-y-6">
          <div className="w-24 h-24 mx-auto mb-8">
            <div className="medical-cross w-full h-full" />
          </div>
          <h2 className="text-4xl font-bold mb-4">
            AI-Powered Healthcare Claims Processing
          </h2>
          <p className="text-xl text-teal-100 mb-6">
            Streamline patient verification, automate preauthorizations, and secure claims with blockchain technology.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-teal-secondary rounded-full"></div>
              <span>Biometric & OTP patient verification</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-teal-secondary rounded-full"></div>
              <span>AI preauthorization with Chain-of-Thought reasoning</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-teal-secondary rounded-full"></div>
              <span>Real-time fraud detection & analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-teal-secondary rounded-full"></div>
              <span>Blockchain claim anchoring on Sepolia</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-teal-secondary rounded-full"></div>
              <span>Comprehensive pharmacy validation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
