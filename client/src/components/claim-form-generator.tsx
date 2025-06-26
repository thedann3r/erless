import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Download, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Service {
  serviceName: string;
  serviceCode: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface Patient {
  fullName: string;
  policyNumber: string;
  age?: number;
  gender?: string;
}

export function ClaimFormGenerator() {
  const [patient, setPatient] = useState<Patient>({
    fullName: 'Mary Wanjiku Kamau',
    policyNumber: 'SHA-2024-789456',
    age: 42,
    gender: 'Female'
  });
  
  const [claimData, setClaimData] = useState({
    insurerName: 'SHA - Social Health Authority',
    schemeName: 'Safaricom Ltd',
    planName: 'Comprehensive Health Plan',
    diagnosis: 'Hypertension with complications',
    icdCode: 'I10.9',
    providerName: 'Aga Khan University Hospital',
    providerCode: 'AKU001',
    dateOfService: new Date().toISOString().split('T')[0]
  });
  
  const [services, setServices] = useState<Service[]>([
    {
      serviceName: 'Consultation - Internal Medicine',
      serviceCode: '99213',
      quantity: 1,
      unitCost: 3500,
      totalCost: 3500
    },
    {
      serviceName: 'ECG - 12 Lead',
      serviceCode: '93000',
      quantity: 1,
      unitCost: 2000,
      totalCost: 2000
    }
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePatient = (field: keyof Patient, value: string | number) => {
    setPatient(prev => ({ ...prev, [field]: value }));
  };

  const updateClaimData = (field: string, value: string) => {
    setClaimData(prev => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    setServices(prev => [...prev, {
      serviceName: '',
      serviceCode: '',
      quantity: 1,
      unitCost: 0,
      totalCost: 0
    }]);
  };

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    setServices(prev => prev.map((service, i) => {
      if (i === index) {
        const updated = { ...service, [field]: value };
        if (field === 'quantity' || field === 'unitCost') {
          updated.totalCost = updated.quantity * updated.unitCost;
        }
        return updated;
      }
      return service;
    }));
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const totalClaimAmount = services.reduce((sum, service) => sum + service.totalCost, 0);

  const handleSubmitClaim = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const requestBody = {
        patient,
        insurerName: claimData.insurerName,
        schemeName: claimData.schemeName,
        planName: claimData.planName,
        diagnosis: claimData.diagnosis,
        icdCode: claimData.icdCode,
        requestedServices: services.filter(s => s.serviceName.trim() !== ''),
        providerName: claimData.providerName,
        providerCode: claimData.providerCode,
        dateOfService: claimData.dateOfService
      };

      const response = await fetch('/api/submit-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate claim form');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claim-form-${patient.fullName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate claim form');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Patient Information
            </CardTitle>
            <CardDescription>
              Enter patient demographics and policy details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={patient.fullName}
                onChange={(e) => updatePatient('fullName', e.target.value)}
                placeholder="Enter patient full name"
              />
            </div>
            <div>
              <Label htmlFor="policyNumber">Policy Number</Label>
              <Input
                id="policyNumber"
                value={patient.policyNumber}
                onChange={(e) => updatePatient('policyNumber', e.target.value)}
                placeholder="Enter policy number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={patient.age || ''}
                  onChange={(e) => updatePatient('age', parseInt(e.target.value) || 0)}
                  placeholder="Age"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={patient.gender} onValueChange={(value) => updatePatient('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance & Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Insurance & Medical Details
            </CardTitle>
            <CardDescription>
              Insurance scheme and diagnosis information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="insurerName">Insurance Provider</Label>
              <Select value={claimData.insurerName} onValueChange={(value) => updateClaimData('insurerName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select insurer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHA - Social Health Authority">SHA - Social Health Authority</SelectItem>
                  <SelectItem value="CIC Insurance">CIC Insurance</SelectItem>
                  <SelectItem value="AAR Insurance">AAR Insurance</SelectItem>
                  <SelectItem value="Jubilee Insurance">Jubilee Insurance</SelectItem>
                  <SelectItem value="AON Minet">AON Minet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schemeName">Scheme Name</Label>
                <Input
                  id="schemeName"
                  value={claimData.schemeName}
                  onChange={(e) => updateClaimData('schemeName', e.target.value)}
                  placeholder="e.g. Safaricom Ltd"
                />
              </div>
              <div>
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  value={claimData.planName}
                  onChange={(e) => updateClaimData('planName', e.target.value)}
                  placeholder="e.g. Silver Cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={claimData.diagnosis}
                  onChange={(e) => updateClaimData('diagnosis', e.target.value)}
                  placeholder="Primary diagnosis"
                />
              </div>
              <div>
                <Label htmlFor="icdCode">ICD-10 Code</Label>
                <Input
                  id="icdCode"
                  value={claimData.icdCode}
                  onChange={(e) => updateClaimData('icdCode', e.target.value)}
                  placeholder="ICD-10 code"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dateOfService">Date of Service</Label>
              <Input
                id="dateOfService"
                type="date"
                value={claimData.dateOfService}
                onChange={(e) => updateClaimData('dateOfService', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Services Provided
            </div>
            <Button onClick={addService} size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-1" />
              Add Service
            </Button>
          </CardTitle>
          <CardDescription>
            List all services and procedures provided to the patient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                <div className="col-span-4">
                  <Label className="text-xs">Service Name</Label>
                  <Input
                    value={service.serviceName}
                    onChange={(e) => updateService(index, 'serviceName', e.target.value)}
                    placeholder="Service name"
                    className="text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Code</Label>
                  <Input
                    value={service.serviceCode}
                    onChange={(e) => updateService(index, 'serviceCode', e.target.value)}
                    placeholder="CPT/Code"
                    className="text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    value={service.quantity}
                    onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Unit Cost</Label>
                  <Input
                    type="number"
                    value={service.unitCost}
                    onChange={(e) => updateService(index, 'unitCost', parseInt(e.target.value) || 0)}
                    placeholder="KES"
                    className="text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Total</Label>
                  <div className="text-sm font-medium p-2 bg-white rounded border">
                    KES {service.totalCost.toLocaleString()}
                  </div>
                </div>
                <div className="col-span-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeService(index)}
                    disabled={services.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Claim Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  KES {totalClaimAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Provider Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="providerName">Provider Name</Label>
              <Input
                id="providerName"
                value={claimData.providerName}
                onChange={(e) => updateClaimData('providerName', e.target.value)}
                placeholder="Healthcare facility name"
              />
            </div>
            <div>
              <Label htmlFor="providerCode">Provider Code</Label>
              <Input
                id="providerCode"
                value={claimData.providerCode}
                onChange={(e) => updateClaimData('providerCode', e.target.value)}
                placeholder="Provider registration code"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 font-medium">Error generating claim form</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleSubmitClaim}
          disabled={isGenerating || !patient.fullName || !claimData.diagnosis}
          className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Form...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Generate & Download Claim Form
            </>
          )}
        </Button>
      </div>
    </div>
  );
}