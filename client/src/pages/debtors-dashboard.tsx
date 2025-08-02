import { useState } from "react";
import { SharedLayout } from "@/components/layout/shared-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Shield,
  X
} from "lucide-react";

export default function DebtorsDashboard() {
  const [, setLocation] = useLocation();
  
  // Mock user data for demo purposes
  const user = {
    id: 13,
    username: "debtors1",
    email: "debtors@test.med",
    name: "Mary Njoroge",
    role: "debtors",
    premiumAccess: true
  };

  return (
    <SharedLayout user={user} className="min-h-screen bg-gray-50">
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-2xl font-bold text-gray-900">247</p>
                  <p className="text-xs text-muted-foreground">Current Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ready Claims</p>
                  <p className="text-2xl font-bold text-gray-900">198</p>
                  <p className="text-xs text-muted-foreground">80% Clean Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Diagnosis</p>
                  <p className="text-2xl font-bold text-gray-900">49</p>
                  <p className="text-xs text-muted-foreground">Awaiting doctors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expected Amount</p>
                  <p className="text-2xl font-bold text-gray-900">KES 2.4M</p>
                  <p className="text-xs text-muted-foreground">Total reimbursements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Claim Batches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-teal-600" />
                <span>Claim Batches</span>
              </CardTitle>
              <CardDescription>
                Track claim submissions by insurer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">SHA Batch #001</p>
                    <p className="text-sm text-gray-600">145 claims</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Ready</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">CIC Batch #002</p>
                    <p className="text-sm text-gray-600">89 claims</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">AAR Batch #003</p>
                    <p className="text-sm text-gray-600">23 claims</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Draft</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Audit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-teal-600" />
                <span>Verification Audit</span>
                <Badge className="bg-teal-100 text-teal-800">Premium</Badge>
              </CardTitle>
              <CardDescription>
                Biometric verification compliance tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">85%</p>
                  <p className="text-xs text-gray-600">Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">12</p>
                  <p className="text-xs text-gray-600">Missing</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">5</p>
                  <p className="text-xs text-gray-600">Mismatches</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>John Wanjiku - Lab Tests</span>
                  </span>
                  <span className="text-gray-500">Verified</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span>Mary Njeri - Pharmacy</span>
                  </span>
                  <span className="text-gray-500">+30min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <X className="h-4 w-4 text-red-600" />
                    <span>David Ochieng - Physio</span>
                  </span>
                  <span className="text-gray-500">Missing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common debtors department workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Submit Batch</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                <AlertTriangle className="h-6 w-6" />
                <span className="text-sm">Send Reminders</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center space-y-2"
                onClick={() => setLocation("/verification-audit")}
              >
                <Shield className="h-6 w-6" />
                <span className="text-sm">Audit Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">Verify Claims</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SharedLayout>
  );
}