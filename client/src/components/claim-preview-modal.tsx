import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Printer, Eye, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClaimPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimData: {
    claimNumber: string;
    patientData: any;
    totalCost: number;
    insurerTemplate: any;
  };
}

export function ClaimPreviewModal({ isOpen, onClose, claimData }: ClaimPreviewModalProps) {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generateHTMLPreview = () => {
    const { claimNumber, patientData, totalCost, insurerTemplate } = claimData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Claim Form - ${claimNumber}</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 40px; 
            line-height: 1.4;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid ${insurerTemplate.colors.primary};
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: ${insurerTemplate.colors.primary};
            margin-bottom: 5px;
          }
          .form-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .claim-number {
            position: absolute;
            top: 40px;
            right: 40px;
            font-weight: bold;
            color: ${insurerTemplate.colors.primary};
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: ${insurerTemplate.colors.primary};
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .info-table td {
            padding: 8px;
            border: 1px solid #ddd;
            vertical-align: top;
          }
          .info-table .label {
            font-weight: bold;
            background-color: ${insurerTemplate.colors.secondary};
            width: 25%;
          }
          .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .services-table th {
            background-color: ${insurerTemplate.colors.secondary};
            padding: 10px;
            border: 1px solid #ddd;
            font-weight: bold;
            text-align: left;
          }
          .services-table td {
            padding: 10px;
            border: 1px solid #ddd;
          }
          .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
          }
          .signature-box {
            width: 30%;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 5px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="claim-number">
          CLAIM NO.<br>
          <strong>${claimNumber}</strong>
        </div>
        
        <div class="header">
          <div class="company-name">${insurerTemplate.name.toUpperCase()}</div>
          <div class="form-title">MEDICAL CLAIM FORM</div>
          <div>OUTPATIENT SERVICES</div>
        </div>

        <div class="section">
          <div class="section-title">PATIENT INFORMATION</div>
          <table class="info-table">
            <tr>
              <td class="label">Member ID:</td>
              <td>${patientData.memberId}</td>
              <td class="label">Date of Birth:</td>
              <td>${new Date(patientData.dateOfBirth).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td class="label">Patient Name:</td>
              <td>${patientData.firstName} ${patientData.lastName}</td>
              <td class="label">Gender:</td>
              <td>${patientData.gender}</td>
            </tr>
            <tr>
              <td class="label">Phone Number:</td>
              <td>${patientData.phoneNumber}</td>
              <td class="label">Emergency Contact:</td>
              <td>${patientData.emergencyContact}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">PROVIDER INFORMATION</div>
          <table class="info-table">
            <tr>
              <td class="label">Provider Name:</td>
              <td>${patientData.currentEncounter?.providerName || 'N/A'}</td>
              <td class="label">Provider ID:</td>
              <td>${patientData.currentEncounter?.providerId || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Attending Doctor:</td>
              <td>${patientData.currentEncounter?.doctorName || 'N/A'}</td>
              <td class="label">Date of Service:</td>
              <td>${patientData.currentEncounter?.date ? new Date(patientData.currentEncounter.date).toLocaleDateString() : 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">CLINICAL INFORMATION</div>
          <table class="info-table">
            <tr>
              <td class="label">Primary Diagnosis:</td>
              <td colspan="3">${patientData.currentEncounter?.diagnosis || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">SERVICES PROVIDED</div>
          <table class="services-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Service Description</th>
                <th>Units</th>
                <th>Amount (KES)</th>
              </tr>
            </thead>
            <tbody>
              ${patientData.currentEncounter?.services.map(service => `
                <tr>
                  <td>${service.code}</td>
                  <td>${service.description}</td>
                  <td>1</td>
                  <td>${service.cost.toLocaleString()}</td>
                </tr>
              `).join('') || ''}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>TOTAL AMOUNT:</strong></td>
                <td><strong>KES ${totalCost.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="signatures">
          <div class="signature-box">
            <div>PATIENT SIGNATURE</div>
            <div class="signature-line">
              Date: ________________
            </div>
          </div>
          <div class="signature-box">
            <div>DOCTOR SIGNATURE</div>
            <div class="signature-line">
              Date: ________________
            </div>
          </div>
          <div class="signature-box">
            <div>PROVIDER STAMP</div>
            <div class="signature-line">
              Date: ________________
            </div>
          </div>
        </div>

        <div class="footer">
          <strong>For office use only:</strong><br>
          Claim processed by: ________________ &nbsp; Date: ________________ &nbsp; Reference: ________________
        </div>
      </body>
      </html>
    `;
  };

  const previewInNewTab = () => {
    const htmlContent = generateHTMLPreview();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const downloadHTML = () => {
    const htmlContent = generateHTMLPreview();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claim-${claimData.claimNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Claim form HTML file is being downloaded",
    });
  };

  const printClaim = () => {
    const htmlContent = generateHTMLPreview();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Claim Form Preview</DialogTitle>
          <DialogDescription>
            Generated {claimData.insurerTemplate.name} claim form - Reference: {claimData.claimNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Form Preview</span>
                <Badge style={{ backgroundColor: claimData.insurerTemplate.colors.primary, color: 'white' }}>
                  {claimData.insurerTemplate.name}
                </Badge>
              </CardTitle>
              <CardDescription>
                Review the generated claim form before downloading or printing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl p-6 bg-white max-h-96 overflow-y-auto">
                <div className="text-center border-b pb-4 mb-6">
                  <h2 className="text-xl font-bold text-primary">{claimData.insurerTemplate.name.toUpperCase()}</h2>
                  <h3 className="text-lg font-semibold">MEDICAL CLAIM FORM</h3>
                  <p className="text-sm">OUTPATIENT SERVICES</p>
                  <div className="absolute top-2 right-2 text-sm font-bold text-primary">
                    CLAIM NO.<br />
                    {claimData.claimNumber}
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-primary border-b mb-2">PATIENT INFORMATION</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Member ID:</strong> {claimData.patientData.memberId}</div>
                      <div><strong>Date of Birth:</strong> {new Date(claimData.patientData.dateOfBirth).toLocaleDateString()}</div>
                      <div><strong>Patient Name:</strong> {claimData.patientData.firstName} {claimData.patientData.lastName}</div>
                      <div><strong>Gender:</strong> {claimData.patientData.gender}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary border-b mb-2">PROVIDER INFORMATION</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Provider Name:</strong> {claimData.patientData.currentEncounter?.providerName}</div>
                      <div><strong>Attending Doctor:</strong> {claimData.patientData.currentEncounter?.doctorName}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary border-b mb-2">SERVICES PROVIDED</h4>
                    <div className="space-y-2">
                      {claimData.patientData.currentEncounter?.services.map((service: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{service.description}</span>
                          <span>KES {service.cost.toLocaleString()}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>TOTAL AMOUNT:</span>
                        <span>KES {claimData.totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={previewInNewTab} variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Full Preview
            </Button>
            <Button onClick={downloadHTML} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download HTML
            </Button>
            <Button onClick={printClaim} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-xl">
            <CheckCircle className="h-4 w-4" />
            <span>Claim form ready for submission to {claimData.insurerTemplate.name}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}