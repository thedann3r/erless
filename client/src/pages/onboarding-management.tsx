import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Clock, CheckCircle, XCircle, Eye, Users, FileText, Phone, Mail, MapPin, Calendar, UserPlus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OnboardingApplication {
  id: number;
  organizationName: string;
  organizationType: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  domain: string;
  licenseNumber: string;
  onboardingStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  schemesSupported: string[];
  servicesOffered?: string[];
  specializations?: string[];
}

interface UserSetup {
  name: string;
  email: string;
  role: string;
  department?: string;
  cadre?: string;
  registrationNumber?: string;
  permissions: string[];
}

export default function OnboardingManagement() {
  const [selectedApplication, setSelectedApplication] = useState<OnboardingApplication | null>(null);
  const [userSetup, setUserSetup] = useState<UserSetup[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/onboarding/applications"],
  });

  const applicationsArray = Array.isArray(applications) ? applications : [];

  const approveMutation = useMutation({
    mutationFn: ({ id, users }: { id: number; users: UserSetup[] }) =>
      apiRequest(`/api/onboarding/approve/${id}`, "POST", { users }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/applications"] });
      setShowApprovalDialog(false);
      setSelectedApplication(null);
      setUserSetup([]);
      toast({
        title: "Application Approved",
        description: "The onboarding application has been approved and user accounts created.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      apiRequest(`/api/onboarding/reject/${id}`, "POST", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/applications"] });
      setShowRejectionDialog(false);
      setSelectedApplication(null);
      setRejectionReason("");
      toast({
        title: "Application Rejected",
        description: "The onboarding application has been rejected.",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const addUser = () => {
    const newUser: UserSetup = {
      name: "",
      email: "",
      role: "front-office",
      permissions: []
    };
    setUserSetup([...userSetup, newUser]);
  };

  const updateUser = (index: number, field: keyof UserSetup, value: any) => {
    const updated = [...userSetup];
    updated[index] = { ...updated[index], [field]: value };
    setUserSetup(updated);
  };

  const removeUser = (index: number) => {
    setUserSetup(userSetup.filter((_, i) => i !== index));
  };

  const handleApprove = (application: OnboardingApplication) => {
    setSelectedApplication(application);
    // Pre-populate with default admin user
    setUserSetup([{
      name: application.contactPerson,
      email: application.contactEmail,
      role: "admin",
      permissions: ["admin", "users", "claims", "analytics"]
    }]);
    setShowApprovalDialog(true);
  };

  const handleReject = (application: OnboardingApplication) => {
    setSelectedApplication(application);
    setShowRejectionDialog(true);
  };

  const viewDetails = (application: OnboardingApplication) => {
    setSelectedApplication(application);
    setShowDetailsDialog(true);
  };

  const availableRoles = [
    { value: "admin", label: "Administrator" },
    { value: "doctor", label: "Doctor/Clinician" },
    { value: "pharmacist", label: "Pharmacist" },
    { value: "care-manager", label: "Care Manager" },
    { value: "front-office", label: "Front Office" },
  ];

  const availablePermissions = [
    "admin", "users", "claims", "preauth", "analytics", "pharmacy", "billing", "reports"
  ];

  const pendingApplications = applications.filter((app: OnboardingApplication) => app.onboardingStatus === 'pending');
  const processedApplications = applications.filter((app: OnboardingApplication) => app.onboardingStatus !== 'pending');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto pt-8">
          <div className="text-center">Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-teal-100 dark:bg-teal-900 p-3 rounded-full mr-4">
              <Building2 className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Onboarding Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Review and approve healthcare provider applications
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pending Applications
              {pendingApplications.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingApplications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processed">Processed Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>
                  Applications awaiting review and approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No pending applications</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApplications.map((app: OnboardingApplication) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.organizationName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{app.domain}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{app.organizationType}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.contactPerson}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{app.contactEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(app.onboardingStatus)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => viewDetails(app)}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleApprove(app)}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleReject(app)}>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processed">
            <Card>
              <CardHeader>
                <CardTitle>Processed Applications</CardTitle>
                <CardDescription>
                  Previously reviewed applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {processedApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No processed applications</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Processed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedApplications.map((app: OnboardingApplication) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.organizationName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{app.domain}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{app.organizationType}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.contactPerson}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{app.contactEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(app.onboardingStatus)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => viewDetails(app)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Application Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedApplication?.organizationName}
              </DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Organization Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{selectedApplication.organizationName}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">{selectedApplication.organizationType}</Badge>
                        <span className="text-sm text-gray-600">{selectedApplication.domain}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        License: {selectedApplication.licenseNumber}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Contact Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedApplication.contactPerson}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedApplication.contactEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedApplication.contactPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Supported Insurance Schemes</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedApplication.schemesSupported.map((scheme, index) => (
                        <Badge key={index} variant="secondary">{scheme}</Badge>
                      ))}
                    </div>
                  </div>

                  {selectedApplication.servicesOffered && selectedApplication.servicesOffered.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Services Offered</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedApplication.servicesOffered.map((service, index) => (
                          <Badge key={index} variant="outline">{service}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplication.specializations && selectedApplication.specializations.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Medical Specializations</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedApplication.specializations.map((spec, index) => (
                          <Badge key={index} variant="outline">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Application Status</Label>
                    <div className="mt-2">
                      {getStatusBadge(selectedApplication.onboardingStatus)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approval Dialog with User Setup */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Approve Application & Setup Users</DialogTitle>
              <DialogDescription>
                Configure user accounts for {selectedApplication?.organizationName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">User Accounts</Label>
                <Button onClick={addUser} size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>

              {userSetup.map((user, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`name-${index}`}>Full Name</Label>
                        <Input
                          id={`name-${index}`}
                          value={user.name}
                          onChange={(e) => updateUser(index, 'name', e.target.value)}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${index}`}>Email Address</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={user.email}
                          onChange={(e) => updateUser(index, 'email', e.target.value)}
                          placeholder="user@domain.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`role-${index}`}>Role</Label>
                        <Select value={user.role} onValueChange={(value) => updateUser(index, 'role', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`department-${index}`}>Department (Optional)</Label>
                        <Input
                          id={`department-${index}`}
                          value={user.department || ''}
                          onChange={(e) => updateUser(index, 'department', e.target.value)}
                          placeholder="e.g., Cardiology, Pharmacy"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="text-sm font-medium">Permissions</Label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {availablePermissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${permission}-${index}`}
                              checked={user.permissions.includes(permission)}
                              onCheckedChange={(checked) => {
                                const newPermissions = checked
                                  ? [...user.permissions, permission]
                                  : user.permissions.filter(p => p !== permission);
                                updateUser(index, 'permissions', newPermissions);
                              }}
                            />
                            <Label htmlFor={`${permission}-${index}`} className="text-sm capitalize">
                              {permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {userSetup.length > 1 && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeUser(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove User
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedApplication && approveMutation.mutate({ id: selectedApplication.id, users: userSetup })}
                  disabled={approveMutation.isPending || userSetup.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approveMutation.isPending ? "Approving..." : "Approve & Create Accounts"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting {selectedApplication?.organizationName}'s application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this application is being rejected..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedApplication && rejectMutation.mutate({ id: selectedApplication.id, reason: rejectionReason })}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  variant="destructive"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject Application"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}