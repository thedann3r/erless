import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Printer, Eye, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Configure pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface ClaimFormGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: PatientSession;
}

interface PatientSession {
  id: string;
  firstName: string;
  lastName: string;
  memberId: string;
  insurerId: string;
  insurerName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emergencyContact: string;
  currentEncounter?: {
    id: string;
    diagnosis: string;
    services: Array<{
      code: string;
      description: string;
      cost: number;
    }>;
    providerId: string;
    providerName: string;
    doctorName: string;
    date: string;
  };
}

interface InsurerTemplate {
  id: string;
  name: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  formFields: string[];
  requiresPreauth: boolean;
}

export function ClaimFormGenerator({ isOpen, onClose, patientData }: ClaimFormGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedClaim, setGeneratedClaim] = useState<any>(null);
  const { toast } = useToast();

  // Insurer templates - this would come from a database in production
  const insurerTemplates: Record<string, InsurerTemplate> = {
    CIC: {
      id: "CIC",
      name: "CIC Insurance",
      colors: { primary: "#0066CC", secondary: "#F0F8FF" },
      formFields: ["claimNumber", "memberDetails", "serviceDetails", "providerInfo", "diagnosis"],
      requiresPreauth: false
    },
    AAR: {
      id: "AAR",
      name: "AAR Insurance",
      colors: { primary: "#FF6600", secondary: "#FFF8F0" },
      formFields: ["claimReference", "patientInfo", "treatmentDetails", "costBreakdown"],
      requiresPreauth: true
    },
    SHA: {
      id: "SHA",
      name: "Social Health Authority",
      colors: { primary: "#006600", secondary: "#F0FFF0" },
      formFields: ["shaNumber", "facilityCode", "serviceCategory", "icd10Code"],
      requiresPreauth: false
    },
    NHIF: {
      id: "NHIF",
      name: "National Hospital Insurance Fund",
      colors: { primary: "#003366", secondary: "#E6F3FF" },
      formFields: ["nhifNumber", "memberCategory", "serviceProvider", "claimDetails"],
      requiresPreauth: false
    }
  };

  const currentTemplate = insurerTemplates[patientData.insurerId] || insurerTemplates.CIC;

  const generateClaimNumber = () => {
    const prefix = currentTemplate.id;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const generateCICClaimForm = () => {
    const claimNumber = generateClaimNumber();
    const totalCost = patientData.currentEncounter?.services.reduce((sum, service) => sum + service.cost, 0) || 0;
    
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        // Header
        {
          columns: [
            {
              image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder
              width: 60,
              height: 60
            },
            {
              text: [
                { text: 'CIC INSURANCE GROUP LTD\n', fontSize: 16, bold: true, color: '#0066CC' },
                { text: 'MEDICAL CLAIM FORM\n', fontSize: 14, bold: true },
                { text: 'OUTPATIENT SERVICES', fontSize: 12 }
              ],
              alignment: 'center',
              margin: [0, 10, 0, 0]
            },
            {
              text: [
                { text: 'CLAIM NO.\n', fontSize: 10, bold: true },
                { text: claimNumber, fontSize: 12, bold: true, color: '#0066CC' }
              ],
              alignment: 'right'
            }
          ],
          columnGap: 20
        },
        
        { text: '', margin: [0, 20, 0, 0] },
        
        // Patient Information Section
        {
          text: 'PATIENT INFORMATION',
          style: 'sectionHeader'
        },
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Member ID:', bold: true },
                { text: patientData.memberId },
                { text: 'Date of Birth:', bold: true },
                { text: new Date(patientData.dateOfBirth).toLocaleDateString() }
              ],
              [
                { text: 'Patient Name:', bold: true },
                { text: `${patientData.firstName} ${patientData.lastName}` },
                { text: 'Gender:', bold: true },
                { text: patientData.gender }
              ],
              [
                { text: 'Phone Number:', bold: true },
                { text: patientData.phoneNumber },
                { text: 'Emergency Contact:', bold: true },
                { text: patientData.emergencyContact }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 5, 0, 15]
        },

        // Provider Information
        {
          text: 'PROVIDER INFORMATION',
          style: 'sectionHeader'
        },
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Provider Name:', bold: true },
                { text: patientData.currentEncounter?.providerName || 'N/A' },
                { text: 'Provider ID:', bold: true },
                { text: patientData.currentEncounter?.providerId || 'N/A' }
              ],
              [
                { text: 'Attending Doctor:', bold: true },
                { text: patientData.currentEncounter?.doctorName || 'N/A' },
                { text: 'Date of Service:', bold: true },
                { text: patientData.currentEncounter?.date ? new Date(patientData.currentEncounter.date).toLocaleDateString() : 'N/A' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 5, 0, 15]
        },

        // Clinical Information
        {
          text: 'CLINICAL INFORMATION',
          style: 'sectionHeader'
        },
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                { text: 'Primary Diagnosis:', bold: true },
                { text: patientData.currentEncounter?.diagnosis || 'N/A' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 5, 0, 15]
        },

        // Services and Costs
        {
          text: 'SERVICES PROVIDED',
          style: 'sectionHeader'
        },
        {
          table: {
            widths: ['15%', '45%', '20%', '20%'],
            headerRows: 1,
            body: [
              [
                { text: 'Code', bold: true, fillColor: '#f0f8ff' },
                { text: 'Service Description', bold: true, fillColor: '#f0f8ff' },
                { text: 'Units', bold: true, fillColor: '#f0f8ff' },
                { text: 'Amount (KES)', bold: true, fillColor: '#f0f8ff' }
              ],
              ...(patientData.currentEncounter?.services.map(service => [
                service.code,
                service.description,
                '1',
                service.cost.toLocaleString()
              ]) || [])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 5, 0, 15]
        },

        // Total Cost
        {
          table: {
            widths: ['60%', '20%', '20%'],
            body: [
              [
                { text: '', border: [false, false, false, false] },
                { text: 'TOTAL AMOUNT:', bold: true, alignment: 'right' },
                { text: `KES ${totalCost.toLocaleString()}`, bold: true, alignment: 'right', color: '#0066CC' }
              ]
            ]
          },
          margin: [0, 0, 0, 20]
        },

        // Signatures
        {
          columns: [
            {
              text: [
                { text: 'PATIENT SIGNATURE\n\n', fontSize: 10, bold: true },
                { text: '________________________\n', fontSize: 10 },
                { text: 'Date: ________________', fontSize: 10 }
              ],
              width: '33%'
            },
            {
              text: [
                { text: 'DOCTOR SIGNATURE\n\n', fontSize: 10, bold: true },
                { text: '________________________\n', fontSize: 10 },
                { text: 'Date: ________________', fontSize: 10 }
              ],
              width: '33%'
            },
            {
              text: [
                { text: 'PROVIDER STAMP\n\n', fontSize: 10, bold: true },
                { text: '________________________\n', fontSize: 10 },
                { text: 'Date: ________________', fontSize: 10 }
              ],
              width: '33%'
            }
          ],
          columnGap: 20,
          margin: [0, 30, 0, 0]
        },

        // Footer
        {
          text: [
            { text: '\nFor office use only:\n', fontSize: 10, bold: true },
            { text: 'Claim processed by: ________________  Date: ________________  Reference: ________________', fontSize: 9 }
          ],
          margin: [0, 30, 0, 0],
          border: [true, true, true, true]
        }
      ],
      styles: {
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#0066CC',
          margin: [0, 10, 0, 5]
        }
      }
    };

    return { docDefinition, claimNumber, totalCost };
  };

  const generateClaimForm = async () => {
    setIsGenerating(true);
    
    try {
      // Generate claim based on insurer type
      const claimData = generateCICClaimForm(); // We'll expand this for other insurers
      
      setGeneratedClaim(claimData);
      
      // Log the claim generation
      await logClaimGeneration(claimData.claimNumber);
      
      toast({
        title: "Claim Form Generated",
        description: `${currentTemplate.name} claim form created successfully`,
      });
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate claim form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const logClaimGeneration = async (claimNumber: string) => {
    // In production, this would log to the database
    console.log(`Claim generated: ${claimNumber} for patient ${patientData.id}`);
  };

  const downloadPDF = () => {
    if (!generatedClaim) return;
    
    pdfMake.createPdf(generatedClaim.docDefinition).download(`claim-${generatedClaim.claimNumber}.pdf`);
    
    toast({
      title: "Download Started",
      description: "Claim form PDF is being downloaded",
    });
  };

  const printPDF = () => {
    if (!generatedClaim) return;
    
    pdfMake.createPdf(generatedClaim.docDefinition).print();
  };

  const previewPDF = () => {
    if (!generatedClaim) return;
    
    pdfMake.createPdf(generatedClaim.docDefinition).open();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Insurance Claim Form</DialogTitle>
          <DialogDescription>
            Auto-populated claim form for {currentTemplate.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient and Insurer Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{patientData.firstName} {patientData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member ID:</span>
                  <span className="font-medium">{patientData.memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DOB:</span>
                  <span className="font-medium">{new Date(patientData.dateOfBirth).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Insurance Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurer:</span>
                  <Badge style={{ backgroundColor: currentTemplate.colors.primary, color: 'white' }}>
                    {currentTemplate.name}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preauth Required:</span>
                  <span className="font-medium">{currentTemplate.requiresPreauth ? 'Yes' : 'No'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Summary */}
          {patientData.currentEncounter && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Encounter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Diagnosis:</span>
                    <span className="font-medium">{patientData.currentEncounter.diagnosis}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium">{patientData.currentEncounter.providerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span className="font-medium">{patientData.currentEncounter.doctorName}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Services Provided:</h4>
                  {patientData.currentEncounter.services.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{service.description}</span>
                      <span className="font-medium">KES {service.cost.toLocaleString()}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total Amount:</span>
                    <span className="text-primary">
                      KES {patientData.currentEncounter.services.reduce((sum, service) => sum + service.cost, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            {!generatedClaim ? (
              <Button 
                onClick={generateClaimForm} 
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <FileText className="h-4 w-4 mr-2 animate-pulse" />
                    Generating Form...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Claim Form
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button onClick={previewPDF} variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={downloadPDF} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={printPDF} variant="outline" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </>
            )}
          </div>

          {generatedClaim && (
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-xl">
              <CheckCircle className="h-4 w-4" />
              <span>Claim form generated successfully with reference: <strong>{generatedClaim.claimNumber}</strong></span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}