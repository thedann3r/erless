import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, CheckCircle, Clock, AlertCircle, Users, Shield, FileText, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { onboardingFormSchema, type OnboardingForm } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function OnboardingPage() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      organizationType: "hospital",
      organizationName: "",
      domain: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      licenseNumber: "",
      schemesSupported: [],
      branch: "",
      servicesOffered: [],
      specializations: [],
      operatingHours: "",
      emergencyServices: false,
    },
  });

  const { data: insurancePolicies } = useQuery({
    queryKey: ["/api/insurance-policies"],
  });

  const submitMutation = useMutation({
    mutationFn: (data: OnboardingForm) => 
      apiRequest("/api/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (result) => {
      setSubmitStatus('success');
      setApplicationId(result.applicationId);
      toast({
        title: "Application Submitted",
        description: "Your onboarding application has been submitted successfully.",
      });
    },
    onError: () => {
      setSubmitStatus('error');
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingForm) => {
    submitMutation.mutate(data);
  };

  const organizationType = form.watch("organizationType");

  const availableSchemes = [
    "SHA Universal Health Coverage",
    "UNHCR Refugee Health Insurance", 
    "CIC General Insurance",
    "AAR Insurance",
    "Jubilee Insurance",
    "Madison Insurance"
  ];

  const hospitalServices = [
    "Emergency Care", "Inpatient Services", "Outpatient Clinics", "Surgery", 
    "Laboratory", "Radiology", "Pharmacy", "Physiotherapy", "Maternity"
  ];

  const clinicServices = [
    "General Practice", "Specialist Consultations", "Minor Procedures", 
    "Laboratory", "Pharmacy", "Physiotherapy", "Dental", "Optical"
  ];

  const pharmacyServices = [
    "Prescription Dispensing", "Over-the-counter Sales", "Health Screenings",
    "Medication Counseling", "Chronic Disease Management", "Vaccination"
  ];

  const specializations = [
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Obstetrics & Gynecology",
    "Internal Medicine", "Surgery", "Oncology", "Psychiatry", "Dermatology"
  ];

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-800 dark:text-green-400">
                Application Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-lg">
                Your onboarding application has been received and is being reviewed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Application ID</p>
                <p className="font-mono text-lg font-semibold">{applicationId}</p>
              </div>
              
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Steps:</strong> Our team will review your application within 2-3 business days. 
                  You'll receive an email notification once the review is complete.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium">Documentation Review</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">1-2 business days</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-sm font-medium">Security Verification</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">1 business day</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium">Account Setup</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Same day</p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Questions about your application? Contact our support team:
                </p>
                <div className="flex justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">+254 700 123 456</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">onboarding@erlessed.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-100 dark:bg-teal-900 p-3 rounded-full mr-3">
              <Building2 className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Join the Erlessed Network
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Digital onboarding for healthcare providers and insurers
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="form" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Application Form</TabsTrigger>
            <TabsTrigger value="info">Process Information</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 text-teal-600 mr-2" />
                    Why Join Erlessed?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">AI-Powered Claims Processing</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Reduce claim processing time from days to minutes with our AI engine
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Real-time Preauthorization</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Instant approval for routine procedures, improving patient experience
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Fraud Prevention</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Advanced analytics detect suspicious patterns and prevent fraud
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Blockchain Security</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Immutable audit trails ensure data integrity and transparency
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    Onboarding Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">1</div>
                      <div>
                        <p className="font-medium">Submit Application</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Complete the digital form with organization details</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 text-sm font-medium">2</div>
                      <div>
                        <p className="font-medium">Document Verification</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Our team verifies licenses and certifications</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-medium">3</div>
                      <div>
                        <p className="font-medium">System Integration</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Connect your existing systems via our APIs</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-medium">4</div>
                      <div>
                        <p className="font-medium">Go Live</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Start processing claims immediately</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  Please provide accurate information about your organization. All fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="organizationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select organization type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hospital">Hospital</SelectItem>
                                <SelectItem value="clinic">Clinic</SelectItem>
                                <SelectItem value="pharmacy-chain">Pharmacy Chain</SelectItem>
                                <SelectItem value="insurer">Insurance Company</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="organizationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter organization name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Domain *</FormLabel>
                            <FormControl>
                              <Input placeholder="example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Domain for user email addresses (e.g., hospital.co.ke)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter license number" {...field} />
                            </FormControl>
                            <FormDescription>
                              {organizationType === 'hospital' && 'Ministry of Health facility license'}
                              {organizationType === 'clinic' && 'Clinical practice license'}
                              {organizationType === 'pharmacy-chain' && 'Pharmacy board license'}
                              {organizationType === 'insurer' && 'Insurance regulatory authority license'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Contact Information</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contactPerson"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Person *</FormLabel>
                              <FormControl>
                                <Input placeholder="Full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@domain.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Phone *</FormLabel>
                              <FormControl>
                                <Input placeholder="+254 700 123 456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {organizationType !== 'insurer' && (
                          <FormField
                            control={form.control}
                            name="branch"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Branch/Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="Main branch, Nairobi, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Physical Address *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter complete physical address including city and postal code"
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Insurance Schemes</h3>
                      <FormField
                        control={form.control}
                        name="schemesSupported"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Supported Insurance Schemes *</FormLabel>
                              <FormDescription>
                                Select all insurance schemes your organization works with
                              </FormDescription>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                              {availableSchemes.map((scheme) => (
                                <FormField
                                  key={scheme}
                                  control={form.control}
                                  name="schemesSupported"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={scheme}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(scheme)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, scheme])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== scheme
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {scheme}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {organizationType !== 'insurer' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Services & Operations</h3>
                        
                        <FormField
                          control={form.control}
                          name="servicesOffered"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel className="text-base">Services Offered</FormLabel>
                                <FormDescription>
                                  Select all services your organization provides
                                </FormDescription>
                              </div>
                              <div className="grid md:grid-cols-3 gap-3">
                                {(organizationType === 'hospital' ? hospitalServices :
                                  organizationType === 'clinic' ? clinicServices :
                                  pharmacyServices).map((service) => (
                                  <FormField
                                    key={service}
                                    control={form.control}
                                    name="servicesOffered"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={service}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(service)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value || [], service])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== service
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {service}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {(organizationType === 'hospital' || organizationType === 'clinic') && (
                          <FormField
                            control={form.control}
                            name="specializations"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel className="text-base">Medical Specializations</FormLabel>
                                  <FormDescription>
                                    Select medical specializations available at your facility
                                  </FormDescription>
                                </div>
                                <div className="grid md:grid-cols-3 gap-3">
                                  {specializations.map((spec) => (
                                    <FormField
                                      key={spec}
                                      control={form.control}
                                      name="specializations"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={spec}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(spec)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([...field.value || [], spec])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) => value !== spec
                                                        )
                                                      );
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="text-sm font-normal">
                                              {spec}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="operatingHours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Operating Hours</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Mon-Fri 8AM-6PM, Sat 9AM-2PM" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {organizationType === 'hospital' && (
                            <FormField
                              control={form.control}
                              name="emergencyServices"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>24/7 Emergency Services</FormLabel>
                                    <FormDescription>
                                      Check if your facility provides round-the-clock emergency care
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          There was an error submitting your application. Please check your information and try again.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end space-x-4 pt-6 border-t">
                      <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Reset Form
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submitMutation.isPending}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Powered by <span className="font-semibold text-teal-600">Aboolean</span> 
            | Secure, Compliant, AI-Driven Healthcare Solutions
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Data Protection Act 2019 Compliant
            </span>
            <span className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              SHA Guidelines Integrated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}