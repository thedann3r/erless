import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Brain, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ClaimsValidationResult {
  decision: 'Approved' | 'Denied';
  confidence: number;
  reason: string;
  reasoning: string[];
  timestamp: string;
  validatedBy: string;
}

export function ClaimsValidator() {
  const [formData, setFormData] = useState({
    fullName: 'Jane Mwangi',
    age: 34,
    sex: 'Female',
    diagnosis: 'Type 2 Diabetes Mellitus',
    icdCode: 'E11.9',
    serviceName: 'HbA1c Test and Consultation',
    procedureCode: '83036',
    planName: 'Comprehensive Health Plan',
    insurerName: 'SHA - Social Health Authority'
  });
  
  const [result, setResult] = useState<ClaimsValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiRequest('/api/claims/validate', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Claims Validation Test
          </CardTitle>
          <CardDescription>
            Test the medical insurance claims validator with patient and service details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Patient Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
                  placeholder="Enter age"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sex">Sex</Label>
              <Select value={formData.sex} onValueChange={(value) => updateField('sex', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => updateField('diagnosis', e.target.value)}
                  placeholder="Enter diagnosis"
                />
              </div>
              <div>
                <Label htmlFor="icdCode">ICD-10 Code</Label>
                <Input
                  id="icdCode"
                  value={formData.icdCode}
                  onChange={(e) => updateField('icdCode', e.target.value)}
                  placeholder="Enter ICD-10 code"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceName">Requested Service</Label>
                <Input
                  id="serviceName"
                  value={formData.serviceName}
                  onChange={(e) => updateField('serviceName', e.target.value)}
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <Label htmlFor="procedureCode">CPT Code</Label>
                <Input
                  id="procedureCode"
                  value={formData.procedureCode}
                  onChange={(e) => updateField('procedureCode', e.target.value)}
                  placeholder="Enter CPT code"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="planName">Policy Plan</Label>
              <Select value={formData.planName} onValueChange={(value) => updateField('planName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic Health Plan">Basic Health Plan</SelectItem>
                  <SelectItem value="Comprehensive Health Plan">Comprehensive Health Plan</SelectItem>
                  <SelectItem value="Premium Health Plan">Premium Health Plan</SelectItem>
                  <SelectItem value="Family Health Plan">Family Health Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="insurerName">Insurance Scheme</Label>
              <Select value={formData.insurerName} onValueChange={(value) => updateField('insurerName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select insurer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHA - Social Health Authority">SHA - Social Health Authority</SelectItem>
                  <SelectItem value="CIC Insurance">CIC Insurance</SelectItem>
                  <SelectItem value="AAR Insurance">AAR Insurance</SelectItem>
                  <SelectItem value="Jubilee Insurance">Jubilee Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating Claim...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Validate Claim
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Validation Results
          </CardTitle>
          <CardDescription>
            System decision and reasoning analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-4 h-4" />
                <span className="font-medium">Validation Error</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Decision */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {result.decision === 'Approved' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <div className="font-semibold text-lg">
                      {result.decision}
                    </div>
                    <div className="text-sm text-gray-600">
                      Confidence: {result.confidence}%
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={result.decision === 'Approved' ? 'default' : 'destructive'}
                  className={result.decision === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {result.confidence}% confident
                </Badge>
              </div>

              {/* Reason */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Primary Reason</Label>
                <p className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  {result.reason}
                </p>
              </div>

              {/* Reasoning Steps */}
              {result.reasoning && result.reasoning.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Reasoning Chain</Label>
                  <div className="mt-1 space-y-2">
                    {result.reasoning.map((step, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="flex-shrink-0 w-5 h-5 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-3 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Validated by: {result.validatedBy}</div>
                  <div>Timestamp: {new Date(result.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {!result && !error && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Fill out the form and click "Validate Claim" to see the system analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}