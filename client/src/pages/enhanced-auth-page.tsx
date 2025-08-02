import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ErllessedLogo } from "@/components/erlessed-logo";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  User, 
  Mail, 
  Lock, 
  Building, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Brain,
  Globe
} from "lucide-react";

const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Full name is required"),
  role: z.string().min(1, "Role selection is required"),
  cadre: z.string().optional(),
  registrationNumber: z.string().optional(),
  careProviderId: z.number().optional(),
  department: z.string().optional(),
  country: z.string().default("kenya"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

interface DomainDetectionResult {
  careProvider: any;
  suggestedRole: string | null;
  suggestedCadre: string | null;
  branch: string | null;
  confidence: number;
}

interface RegistrationValidationResult {
  isValid: boolean;
  registrationBody: string | null;
  cadre: string | null;
  specialization: string | null;
  expiryDate: string | null;
  errors: string[];
}

interface RoleOption {
  value: string;
  label: string;
  requiresRegistration: boolean;
}

interface CadreOption {
  value: string;
  label: string;
}

export default function EnhancedAuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Domain detection and validation states
  const [domainResult, setDomainResult] = useState<DomainDetectionResult | null>(null);
  const [registrationResult, setRegistrationResult] = useState<RegistrationValidationResult | null>(null);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [cadreOptions, setCadreOptions] = useState<CadreOption[]>([]);
  const [careProviders, setCareProviders] = useState<any[]>([]);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [isValidatingRegistration, setIsValidatingRegistration] = useState(false);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      role: "",
      cadre: "",
      registrationNumber: "",
      department: "",
      country: "kenya"
    }
  });

  const selectedRole = form.watch("role");
  const emailValue = form.watch("email");
  const registrationNumber = form.watch("registrationNumber");

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Load initial data
  useEffect(() => {
    loadRoleOptions();
    loadCareProviders();
  }, []);

  // Validate email domain when email changes
  useEffect(() => {
    if (emailValue && emailValue.includes("@")) {
      validateEmailDomain(emailValue);
    }
  }, [emailValue]);

  // Load cadre options when role changes
  useEffect(() => {
    if (selectedRole) {
      loadCadreOptions(selectedRole);
    }
  }, [selectedRole]);

  // Validate registration number when it changes
  useEffect(() => {
    if (registrationNumber && selectedRole && registrationNumber.length >= 6) {
      validateRegistrationNumber(registrationNumber, selectedRole);
    }
  }, [registrationNumber, selectedRole]);

  const loadRoleOptions = async () => {
    try {
      const response = await fetch("/api/roles");
      const data = await response.json();
      setRoleOptions(data.roleOptions || []);
    } catch (error) {
      console.error("Failed to load role options:", error);
    }
  };

  const loadCareProviders = async () => {
    try {
      const response = await fetch("/api/care-providers");
      const data = await response.json();
      setCareProviders(data || []);
    } catch (error) {
      console.error("Failed to load care providers:", error);
    }
  };

  const loadCadreOptions = async (role: string) => {
    try {
      const response = await fetch(`/api/roles?role=${role}`);
      const data = await response.json();
      setCadreOptions(data.cadreOptions || []);
    } catch (error) {
      console.error("Failed to load cadre options:", error);
    }
  };

  const validateEmailDomain = async (email: string) => {
    setIsValidatingEmail(true);
    try {
      const response = await fetch("/api/register/validate-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.domain) {
        setDomainResult(data.domain);
        
        // Auto-fill detected values
        if (data.domain.careProvider) {
          form.setValue("careProviderId", data.domain.careProvider.id);
        }
        if (data.domain.suggestedRole) {
          form.setValue("role", data.domain.suggestedRole);
        }
        if (data.domain.suggestedCadre) {
          form.setValue("cadre", data.domain.suggestedCadre);
        }
      }
    } catch (error) {
      console.error("Domain validation failed:", error);
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const validateRegistrationNumber = async (regNumber: string, role: string) => {
    setIsValidatingRegistration(true);
    try {
      const response = await fetch("/api/register/validate-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: emailValue,
          registrationNumber: regNumber, 
          role,
          country: form.getValues("country")
        })
      });
      
      const data = await response.json();
      
      if (data.registration) {
        setRegistrationResult(data.registration);
        
        if (data.registration.isValid && data.registration.cadre) {
          form.setValue("cadre", data.registration.cadre);
        }
      }
    } catch (error) {
      console.error("Registration validation failed:", error);
    } finally {
      setIsValidatingRegistration(false);
    }
  };

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
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (data: RegistrationForm) => {
    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        cadre: data.cadre || null,
        careProviderId: data.careProviderId || null,
        department: data.department || null,
        registrationNumber: data.registrationNumber || null,
        registrationBody: registrationResult?.registrationBody || null,
        isVerified: registrationResult?.isValid || false
      });
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully."
      });
      
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requiresRegistration = roleOptions.find(r => r.value === selectedRole)?.requiresRegistration;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column - Branding & Info */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <ErllessedLogo size="lg" />
            <h1 className="text-4xl font-bold text-gray-900">
              Secure Healthcare Platform
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Advanced AI-powered claims processing with domain-based authentication 
              and professional license verification for healthcare providers.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <div className="w-8 h-8 bg-teal-primary rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700">Auto-detect care provider from email domain</span>
            </div>
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700">AI-powered preauthorization decisions</span>
            </div>
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700">Professional license verification</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mt-8">
            Powered by <span className="font-semibold text-teal-primary">Aboolean</span>
          </div>
        </div>

        {/* Right Column - Authentication Forms */}
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your Erlessed account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-username"
                        name="username"
                        placeholder="Enter your username"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full teal-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Registration Tab */}
            <TabsContent value="register">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <CardDescription>
                  Join the Erlessed healthcare platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleRegistration)} className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        {...form.register("username")}
                        placeholder="Choose username"
                      />
                      {form.formState.errors.username && (
                        <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="Your full name"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email with Domain Detection */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        {...form.register("email")}
                        type="email"
                        placeholder="your.name@hospital.com"
                        className="pl-10"
                      />
                      {isValidatingEmail && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
                      )}
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                    
                    {/* Domain Detection Result */}
                    {domainResult && (
                      <Alert className={domainResult.careProvider ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                        <Globe className="w-4 h-4" />
                        <AlertDescription>
                          {domainResult.careProvider ? (
                            <div className="space-y-1">
                              <p className="font-medium text-green-800">
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                Care Provider Detected: {domainResult.careProvider.name}
                              </p>
                              {domainResult.suggestedRole && (
                                <p className="text-sm text-green-700">
                                  Suggested Role: {domainResult.suggestedRole}
                                </p>
                              )}
                              <Badge className="text-xs">
                                {domainResult.confidence}% confidence
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-yellow-800">
                              <AlertCircle className="w-4 h-4 inline mr-1" />
                              Unknown domain. Please select care provider manually.
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={form.watch("role")} 
                        onValueChange={(value) => form.setValue("role", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                              {role.requiresRegistration && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Requires License
                                </Badge>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.role && (
                        <p className="text-sm text-red-600">{form.formState.errors.role.message}</p>
                      )}
                    </div>

                    {/* Cadre Selection */}
                    {cadreOptions.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="cadre">Cadre/Specialization</Label>
                        <Select 
                          value={form.watch("cadre")} 
                          onValueChange={(value) => form.setValue("cadre", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select cadre" />
                          </SelectTrigger>
                          <SelectContent>
                            {cadreOptions.map((cadre) => (
                              <SelectItem key={cadre.value} value={cadre.value}>
                                {cadre.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Professional Registration */}
                  {requiresRegistration && (
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">
                        Professional Registration Number
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="registrationNumber"
                          {...form.register("registrationNumber")}
                          placeholder="e.g., KMP/12345"
                          className="pl-10"
                        />
                        {isValidatingRegistration && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
                        )}
                      </div>
                      
                      {/* Registration Validation Result */}
                      {registrationResult && (
                        <Alert className={registrationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                          {registrationResult.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <AlertDescription>
                            {registrationResult.isValid ? (
                              <div className="space-y-1">
                                <p className="font-medium text-green-800">
                                  Valid registration verified
                                </p>
                                <p className="text-sm text-green-700">
                                  Board: {registrationResult.registrationBody}
                                </p>
                                {registrationResult.expiryDate && (
                                  <p className="text-sm text-green-700">
                                    Valid until: {registrationResult.expiryDate}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium text-red-800">Registration validation failed</p>
                                {registrationResult.errors.map((error, i) => (
                                  <p key={i} className="text-sm text-red-700">{error}</p>
                                ))}
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Care Provider Selection (if not auto-detected) */}
                  {!domainResult?.careProvider && careProviders.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="careProvider">Care Provider</Label>
                      <Select 
                        value={form.watch("careProviderId")?.toString()} 
                        onValueChange={(value) => form.setValue("careProviderId", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your facility" />
                        </SelectTrigger>
                        <SelectContent>
                          {careProviders.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4" />
                                <span>{provider.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {provider.type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        {...form.register("password")}
                        type="password"
                        placeholder="Create password"
                      />
                      {form.formState.errors.password && (
                        <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        {...form.register("confirmPassword")}
                        type="password"
                        placeholder="Confirm password"
                      />
                      {form.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full teal-button"
                    disabled={isLoading || (requiresRegistration && !registrationResult?.isValid)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}