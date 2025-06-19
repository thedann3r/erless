import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Database, FileText, Heart, TestTube, Pill, Activity, Upload, Download, Shield, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HMSIntegrationPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "complete" | "error">("idle");
  const [syncProgress, setSyncProgress] = useState(0);
  
  const [hmsCredentials, setHmsCredentials] = useState({
    system_type: "",
    base_url: "",
    username: "",
    password: "",
    client_id: "",
    client_secret: "",
    oauth_endpoint: ""
  });

  const [syncConfig, setSyncConfig] = useState({
    include_vitals: true,
    include_labs: true,
    include_prescriptions: true,
    include_diagnoses: true,
    patient_ids: "",
    date_from: "",
    date_to: ""
  });

  const handleSync = async (syncType: string) => {
    setSyncStatus("syncing");
    setSyncProgress(0);
    
    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncStatus("complete");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const syncMetrics = {
    vitals_synced: 247,
    labs_synced: 156,
    prescriptions_synced: 89,
    diagnoses_synced: 134,
    last_sync: "2024-06-18 18:45:23",
    total_patients: 67
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HMS Integration Service</h1>
          <p className="text-gray-600">Secure microservice for hospital management system integration</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Database className="w-4 h-4 mr-1" />
            Service Active
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Port 8001
          </Badge>
        </div>
      </div>

      {/* Service Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Service Status</p>
                <p className="text-2xl font-bold text-green-600">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connected HMS</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Records Synced</p>
                <p className="text-2xl font-bold text-gray-900">{syncMetrics.vitals_synced + syncMetrics.labs_synced + syncMetrics.prescriptions_synced + syncMetrics.diagnoses_synced}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-teal-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Sync</p>
                <p className="text-sm font-bold text-gray-900">{syncMetrics.last_sync}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Service Overview</TabsTrigger>
          <TabsTrigger value="sync">Data Synchronization</TabsTrigger>
          <TabsTrigger value="config">HMS Configuration</TabsTrigger>
          <TabsTrigger value="consent">Patient Consent</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-600" />
                  Supported HMS Systems
                </CardTitle>
                <CardDescription>
                  Compatible hospital management systems and integration methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">OpenMRS</p>
                    <p className="text-sm text-gray-600">REST API + Session Auth</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">AfyaPro</p>
                    <p className="text-sm text-gray-600">FHIR + OAuth2</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Custom EMR</p>
                    <p className="text-sm text-gray-600">Token-based Auth</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-600" />
                  Sync Statistics
                </CardTitle>
                <CardDescription>
                  Real-time synchronization metrics and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-blue-600" />
                    Vital Signs
                  </span>
                  <span className="font-semibold">{syncMetrics.vitals_synced}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <TestTube className="w-4 h-4 mr-2 text-green-600" />
                    Lab Results
                  </span>
                  <span className="font-semibold">{syncMetrics.labs_synced}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Pill className="w-4 h-4 mr-2 text-purple-600" />
                    Prescriptions
                  </span>
                  <span className="font-semibold">{syncMetrics.prescriptions_synced}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-orange-600" />
                    Diagnoses
                  </span>
                  <span className="font-semibold">{syncMetrics.diagnoses_synced}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available API Endpoints</CardTitle>
              <CardDescription>HMS integration service endpoints and capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Synchronization Endpoints</h4>
                  <div className="space-y-1 text-sm">
                    <div><code className="bg-gray-100 px-2 py-1 rounded">POST /sync/vitals</code></div>
                    <div><code className="bg-gray-100 px-2 py-1 rounded">POST /sync/labs</code></div>
                    <div><code className="bg-gray-100 px-2 py-1 rounded">POST /sync/prescriptions</code></div>
                    <div><code className="bg-gray-100 px-2 py-1 rounded">POST /sync/diagnoses</code></div>
                    <div><code className="bg-gray-100 px-2 py-1 rounded">POST /sync/bulk</code></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">File Upload Endpoints</h4>
                  <div className="space-y-1 text-sm">
                    <div><code className="bg-gray-100 px-2 py-1 rounded">POST /sync/file/vitals</code></div>
                    <div><code className="bg-gray-100 px-2 py-1 rounded">POST /sync/file/labs</code></div>
                    <div><code className="bg-gray-100 px-2 py-1 rounded">GET /sync/status</code></div>
                    <div><code className="bg-gray-100 px-2 py-1 rounded">POST /consent/log</code></div>
                    <div><code className="bg-gray-100 px-2 py-1 rounded">GET /consent/verify/{id}</code></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Synchronization Control</CardTitle>
              <CardDescription>Configure and execute data synchronization with HMS systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {syncStatus === "syncing" && (
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    Synchronization in progress... {syncProgress}%
                    <Progress value={syncProgress} className="mt-2" />
                  </AlertDescription>
                </Alert>
              )}

              {syncStatus === "complete" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Synchronization completed successfully
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Sync Configuration</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="vitals">Include Vital Signs</Label>
                      <Switch
                        id="vitals"
                        checked={syncConfig.include_vitals}
                        onCheckedChange={(checked) => setSyncConfig({...syncConfig, include_vitals: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="labs">Include Lab Results</Label>
                      <Switch
                        id="labs"
                        checked={syncConfig.include_labs}
                        onCheckedChange={(checked) => setSyncConfig({...syncConfig, include_labs: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="prescriptions">Include Prescriptions</Label>
                      <Switch
                        id="prescriptions"
                        checked={syncConfig.include_prescriptions}
                        onCheckedChange={(checked) => setSyncConfig({...syncConfig, include_prescriptions: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="diagnoses">Include Diagnoses</Label>
                      <Switch
                        id="diagnoses"
                        checked={syncConfig.include_diagnoses}
                        onCheckedChange={(checked) => setSyncConfig({...syncConfig, include_diagnoses: checked})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="patient_ids">Patient IDs (comma-separated)</Label>
                    <Textarea
                      id="patient_ids"
                      placeholder="P001, P002, P003 or leave empty for all patients"
                      value={syncConfig.patient_ids}
                      onChange={(e) => setSyncConfig({...syncConfig, patient_ids: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="date_from">From Date</Label>
                      <Input
                        id="date_from"
                        type="date"
                        value={syncConfig.date_from}
                        onChange={(e) => setSyncConfig({...syncConfig, date_from: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_to">To Date</Label>
                      <Input
                        id="date_to"
                        type="date"
                        value={syncConfig.date_to}
                        onChange={(e) => setSyncConfig({...syncConfig, date_to: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Sync Actions</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleSync("vitals")}
                      disabled={syncStatus === "syncing"}
                      className="w-full"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Sync Vitals
                    </Button>
                    <Button
                      onClick={() => handleSync("labs")}
                      disabled={syncStatus === "syncing"}
                      variant="outline"
                      className="w-full"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Sync Labs
                    </Button>
                    <Button
                      onClick={() => handleSync("prescriptions")}
                      disabled={syncStatus === "syncing"}
                      variant="outline"
                      className="w-full"
                    >
                      <Pill className="w-4 h-4 mr-2" />
                      Sync Prescriptions
                    </Button>
                    <Button
                      onClick={() => handleSync("diagnoses")}
                      disabled={syncStatus === "syncing"}
                      variant="outline"
                      className="w-full"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Sync Diagnoses
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleSync("bulk")}
                    disabled={syncStatus === "syncing"}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Bulk Synchronization
                  </Button>

                  <div className="border-t pt-4 space-y-3">
                    <h5 className="font-medium text-sm">File Upload Fallback</h5>
                    <div className="grid grid-cols-1 gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CSV File
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload XML File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HMS System Configuration</CardTitle>
              <CardDescription>Configure connection settings for hospital management systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="system_type">HMS System Type</Label>
                    <Select
                      value={hmsCredentials.system_type}
                      onValueChange={(value) => setHmsCredentials({...hmsCredentials, system_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select HMS type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openmrs">OpenMRS</SelectItem>
                        <SelectItem value="afyapro">AfyaPro</SelectItem>
                        <SelectItem value="custom">Custom EMR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="base_url">Base URL</Label>
                    <Input
                      id="base_url"
                      placeholder="https://hms.hospital.com"
                      value={hmsCredentials.base_url}
                      onChange={(e) => setHmsCredentials({...hmsCredentials, base_url: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="HMS username"
                      value={hmsCredentials.username}
                      onChange={(e) => setHmsCredentials({...hmsCredentials, username: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="HMS password"
                      value={hmsCredentials.password}
                      onChange={(e) => setHmsCredentials({...hmsCredentials, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="client_id">Client ID (OAuth2)</Label>
                    <Input
                      id="client_id"
                      placeholder="OAuth2 client ID"
                      value={hmsCredentials.client_id}
                      onChange={(e) => setHmsCredentials({...hmsCredentials, client_id: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="client_secret">Client Secret (OAuth2)</Label>
                    <Input
                      id="client_secret"
                      type="password"
                      placeholder="OAuth2 client secret"
                      value={hmsCredentials.client_secret}
                      onChange={(e) => setHmsCredentials({...hmsCredentials, client_secret: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="oauth_endpoint">OAuth2 Token Endpoint</Label>
                    <Input
                      id="oauth_endpoint"
                      placeholder="https://hms.hospital.com/oauth/token"
                      value={hmsCredentials.oauth_endpoint}
                      onChange={(e) => setHmsCredentials({...hmsCredentials, oauth_endpoint: e.target.value})}
                    />
                  </div>

                  <div className="pt-4">
                    <Button className="w-full">Test Connection</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Patient Consent Management
              </CardTitle>
              <CardDescription>
                Manage patient consent for data synchronization and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Patient consent is required before any data synchronization. All consent is logged with fingerprint/OTP verification.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Log Patient Consent</h4>
                  
                  <div>
                    <Label htmlFor="patient_id">Patient ID</Label>
                    <Input id="patient_id" placeholder="P001234" />
                  </div>

                  <div>
                    <Label htmlFor="consent_type">Consent Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select consent type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="data_sync">Data Synchronization</SelectItem>
                        <SelectItem value="analytics">Analytics Processing</SelectItem>
                        <SelectItem value="sharing">Data Sharing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="granted_by">Granted By</Label>
                    <Input id="granted_by" placeholder="Healthcare provider name" />
                  </div>

                  <div>
                    <Label htmlFor="fingerprint_hash">Fingerprint Hash</Label>
                    <Input id="fingerprint_hash" placeholder="SHA256 fingerprint hash" />
                  </div>

                  <div>
                    <Label htmlFor="otp_code">OTP Code</Label>
                    <Input id="otp_code" placeholder="6-digit OTP verification" />
                  </div>

                  <Button className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Log Consent
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Consent Verification</h4>
                  
                  <div>
                    <Label htmlFor="verify_patient_id">Patient ID</Label>
                    <Input id="verify_patient_id" placeholder="P001234" />
                  </div>

                  <div>
                    <Label htmlFor="verify_consent_type">Consent Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select consent type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="data_sync">Data Synchronization</SelectItem>
                        <SelectItem value="analytics">Analytics Processing</SelectItem>
                        <SelectItem value="sharing">Data Sharing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" className="w-full">
                    Verify Consent
                  </Button>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Recent Consent Activities</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>P001234 - Data Sync</span>
                        <Badge variant="outline" className="text-green-600">Valid</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>P001235 - Analytics</span>
                        <Badge variant="outline" className="text-green-600">Valid</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>P001236 - Data Sync</span>
                        <Badge variant="outline" className="text-yellow-600">Expired</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        Powered by Aboolean • HMS Integration Service v1.0.0
      </div>
    </div>
  );
}