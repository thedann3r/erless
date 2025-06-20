import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ErllessedLogo } from "@/components/erlessed-logo";
import { Building2, CheckCircle, AlertCircle, User, FileText } from "lucide-react";

interface CareProvider {
  id: string;
  name: string;
  domain: string;
  type: "hospital" | "clinic" | "pharmacy" | "insurance";
}

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: string;
  careProviderId?: string;
  regulatorType?: string;
  registrationNumber?: string;
}

const CARE_PROVIDERS: CareProvider[] = [
  { id: "aku", name: "Aga Khan University Hospital", domain: "aku.edu", type: "hospital" },
  { id: "knh", name: "Kenyatta National Hospital", domain: "knh.or.ke", type: "hospital" },
  { id: "mnh", name: "Mater Hospital", domain: "materhealth.com", type: "hospital" },
  { id: "nairobi-hospital", name: "The Nairobi Hospital", domain: "nairobihospital.org", type: "hospital" },
  { id: "mp-shah", name: "MP Shah Hospital", domain: "mpshah.org", type: "hospital" },
  { id: "avenue-healthcare", name: "Avenue Healthcare", domain: "avenue.co.ke", type: "clinic" },
  { id: "goodlife-pharmacy", name: "Goodlife Pharmacy", domain: "goodlife.co.ke", type: "pharmacy" },
  { id: "nhif", name: "National Hospital Insurance Fund", domain: "nhif.or.ke", type: "insurance" },
  { id: "axa-kenya", name: "AXA Kenya", domain: "axa.co.ke", type: "insurance" },
  { id: "jubilee-insurance", name: "Jubilee Insurance", domain: "jubileekenya.com", type: "insurance" }
];

const USER_ROLES = [
  { value: "doctor", label: "Doctor", clinical: true },
  { value: "pharmacist", label: "Pharmacist", clinical: true },
  { value: "clinical-officer", label: "Clinical Officer", clinical: true },
  { value: "billing-officer", label: "Billing Officer", clinical: false },
  { value: "care-manager", label: "Care Manager", clinical: false },
  { value: "front-office", label: "Front Office", clinical: false },
  { value: "insurer-officer", label: "Insurer Officer", clinical: false }
];

const REGULATORS = [
  { value: "KMPDC", label: "Kenya Medical Practitioners and Dentists Council (KMPDC)" },
  { value: "COC", label: "Clinical Officers Council (COC)" },
  { value: "PPB", label: "Pharmacy and Poisons Board (PPB)" }
];

export default function EnhancedSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "verified" | "failed">("idle");
  
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  const selectedRole = USER_ROLES.find(role => role.value === formData.role);
  const detectedProvider = CARE_PROVIDERS.find(provider => 
    formData.email.includes(`@${provider.domain}`)
  );

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.role) {
      toast({
        title: "Validation Error",
        description: "Please select your role",
        variant: "destructive"
      });
      return false;
    }

    if (selectedRole?.clinical) {
      if (!formData.regulatorType) {
        toast({
          title: "Validation Error",
          description: "Please select your regulatory body",
          variant: "destructive"
        });
        return false;
      }
      
      if (!formData.registrationNumber?.trim()) {
        toast({
          title: "Validation Error",
          description: "Registration number is required for clinical roles",
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const verifyLicense = async () => {
    if (!formData.regulatorType || !formData.registrationNumber) return;
    
    setVerificationStatus("verifying");
    
    // Simulate license verification API call
    setTimeout(() => {
      const isValid = Math.random() > 0.3; // 70% success rate for demo
      setVerificationStatus(isValid ? "verified" : "failed");
      
      toast({
        title: isValid ? "License Verified" : "Verification Failed",
        description: isValid 
          ? "Your professional license has been validated"
          : "Unable to verify license. Please check your details",
        variant: isValid ? "default" : "destructive"
      });
    }, 2000);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Registration Successful",
        description: `Welcome to Erlessed, ${formData.name}! Redirecting to your dashboard...`,
      });

      // Redirect based on role
      setTimeout(() => {
        switch (formData.role) {
          case "doctor":
            setLocation("/doctor");
            break;
          case "pharmacist":
            setLocation("/pharmacy-dashboard");
            break;
          case "care-manager":
            setLocation("/care-manager-dashboard");
            break;
          case "insurer-officer":
            setLocation("/insurer");
            break;
          case "clinical-officer":
          case "billing-officer":
          case "front-office":
            setLocation("/patient");
            break;
          default:
            setLocation("/");
        }
      }, 2000);

    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressValue = () => {
    if (step === 1) return 33;
    if (step === 2 && !selectedRole?.clinical) return 100;
    if (step === 2 && selectedRole?.clinical) return 66;
    return 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex">
      {/* Left Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <ErllessedLogo className="mx-auto h-16 w-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Join Erlessed</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create your healthcare professional account
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Step {step} of 2</span>
              <span>{Math.round(getProgressValue())}% Complete</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">
                {step === 1 ? "Personal Information" : "Professional Details"}
              </CardTitle>
              <CardDescription>
                {step === 1 
                  ? "Enter your basic information to get started"
                  : "Set up your professional profile"
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your full name"
                      className="medical-form-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your.email@hospital.com"
                      className="medical-form-input"
                      required
                    />
                    {detectedProvider && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                          {detectedProvider.name} Detected
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Create a secure password"
                      className="medical-form-input"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <Button type="submit" className="w-full teal-button">
                    Continue to Professional Details
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  {/* Care Provider Detection */}
                  {detectedProvider && (
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building2 className="w-5 h-5 text-teal-600" />
                        <h3 className="font-medium text-teal-800">Care Provider Detected</h3>
                      </div>
                      <p className="text-sm text-teal-700">
                        You'll be automatically assigned to <strong>{detectedProvider.name}</strong>
                      </p>
                    </div>
                  )}

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label>Select Your Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                      <SelectTrigger className="medical-form-input">
                        <SelectValue placeholder="Choose your professional role" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center justify-between w-full">
                              {role.label}
                              {role.clinical && (
                                <Badge variant="outline" className="ml-2 text-xs">Clinical</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clinical Role Verification */}
                  {selectedRole?.clinical && (
                    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="font-medium text-blue-800">Professional License Verification</h3>
                      </div>

                      <div className="space-y-2">
                        <Label>Regulatory Body</Label>
                        <Select 
                          value={formData.regulatorType} 
                          onValueChange={(value) => setFormData({...formData, regulatorType: value})}
                        >
                          <SelectTrigger className="medical-form-input">
                            <SelectValue placeholder="Select your regulatory authority" />
                          </SelectTrigger>
                          <SelectContent>
                            {REGULATORS.map((regulator) => (
                              <SelectItem key={regulator.value} value={regulator.value}>
                                {regulator.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Registration Number</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={formData.registrationNumber}
                            onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                            placeholder="Enter your registration number"
                            className="medical-form-input flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={verifyLicense}
                            disabled={verificationStatus === "verifying" || !formData.registrationNumber}
                            className="whitespace-nowrap"
                          >
                            {verificationStatus === "verifying" ? "Verifying..." : "Verify"}
                          </Button>
                        </div>
                        
                        {verificationStatus === "verified" && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">License verified successfully</span>
                          </div>
                        )}
                        
                        {verificationStatus === "failed" && (
                          <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Verification failed - please check details</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 teal-button"
                    >
                      {isLoading ? "Creating Account..." : "Complete Registration"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Powered by Aboolean Systems
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-teal-600 to-blue-700 text-white p-12 items-center justify-center">
        <div className="max-w-lg">
          <h3 className="text-3xl font-bold mb-8">
            Professional Healthcare Platform
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Role-Based Access</h4>
                <p className="text-teal-100 text-sm">
                  Tailored dashboards for every healthcare professional
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">License Verification</h4>
                <p className="text-teal-100 text-sm">
                  Automated validation with Kenya regulatory boards
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Institution Integration</h4>
                <p className="text-teal-100 text-sm">
                  Seamless connection with major healthcare providers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}