import PDFMake from 'pdfmake/build/pdfmake';
import PDFMakeFonts from 'pdfmake/build/vfs_fonts';
import fs from 'fs/promises';
import path from 'path';

// Initialize PDFMake with fonts
PDFMake.vfs = PDFMakeFonts.pdfMake.vfs;

interface ClaimFormData {
  fullName: string;
  policyNumber: string;
  insurerName: string;
  schemeName: string;
  planName: string;
  diagnosis: string;
  icdCode: string;
  requestedServices?: Array<{
    serviceName: string;
    serviceCode: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  patientAge?: number;
  patientGender?: string;
  dateOfService?: string;
  providerName?: string;
  providerCode?: string;
  claimAmount?: number;
}

interface FormTemplate {
  name: string;
  insurerName: string;
  logoPath?: string;
  headerColor: string;
  layout: 'standard' | 'detailed' | 'compact';
  requiredFields: string[];
  customSections?: any[];
}

// Form templates for different insurers
const FORM_TEMPLATES: Record<string, FormTemplate> = {
  'SHA': {
    name: 'SHA Claim Form',
    insurerName: 'Social Health Authority',
    headerColor: '#2563eb',
    layout: 'standard',
    requiredFields: ['fullName', 'policyNumber', 'diagnosis', 'icdCode', 'dateOfService']
  },
  'CIC': {
    name: 'CIC Insurance Claim Form',
    insurerName: 'CIC Insurance Group',
    headerColor: '#dc2626',
    layout: 'detailed',
    requiredFields: ['fullName', 'policyNumber', 'diagnosis', 'icdCode', 'requestedServices']
  },
  'AAR': {
    name: 'AAR Insurance Claim Form',
    insurerName: 'AAR Insurance Kenya',
    headerColor: '#059669',
    layout: 'standard',
    requiredFields: ['fullName', 'policyNumber', 'diagnosis', 'icdCode']
  },
  'JUBILEE': {
    name: 'Jubilee Insurance Claim Form',
    insurerName: 'Jubilee Insurance',
    headerColor: '#7c3aed',
    layout: 'compact',
    requiredFields: ['fullName', 'policyNumber', 'diagnosis']
  },
  'AON': {
    name: 'AON Minet Claim Form',
    insurerName: 'AON Minet Insurance Brokers',
    headerColor: '#ea580c',
    layout: 'detailed',
    requiredFields: ['fullName', 'policyNumber', 'schemeName', 'diagnosis', 'icdCode']
  }
};

export function selectFormTemplate(insurerName: string): FormTemplate {
  // Normalize insurer name for lookup
  const normalizedName = insurerName.toUpperCase().replace(/[^A-Z]/g, '');
  
  // Try exact matches first
  if (FORM_TEMPLATES[normalizedName]) {
    return FORM_TEMPLATES[normalizedName];
  }
  
  // Try partial matches
  for (const [key, template] of Object.entries(FORM_TEMPLATES)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return template;
    }
  }
  
  // Default to SHA template
  return FORM_TEMPLATES['SHA'];
}

export async function fillClaimForm(template: FormTemplate, formData: ClaimFormData): Promise<string> {
  const currentDate = new Date().toLocaleDateString('en-GB');
  const claimNumber = `CLM-${Date.now()}`;
  
  // Calculate total claim amount
  const totalAmount = formData.requestedServices?.reduce((sum, service) => sum + service.totalCost, 0) || formData.claimAmount || 0;
  
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    
    header: {
      columns: [
        {
          text: template.insurerName,
          style: 'header',
          color: template.headerColor,
          fontSize: 18,
          bold: true,
          margin: [40, 20, 0, 0]
        },
        {
          text: `Claim Form\n${currentDate}`,
          style: 'headerRight',
          alignment: 'right',
          fontSize: 10,
          margin: [0, 20, 40, 0]
        }
      ]
    },
    
    content: [
      // Title
      {
        text: template.name,
        style: 'title',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      
      // Claim Information
      {
        text: 'CLAIM INFORMATION',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: `Claim Number: ${claimNumber}`, margin: [0, 0, 0, 5] },
              { text: `Date of Claim: ${currentDate}`, margin: [0, 0, 0, 5] },
              { text: `Policy Number: ${formData.policyNumber}`, margin: [0, 0, 0, 5] }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: `Scheme: ${formData.schemeName}`, margin: [0, 0, 0, 5] },
              { text: `Plan: ${formData.planName}`, margin: [0, 0, 0, 5] },
              { text: `Total Amount: KES ${totalAmount.toLocaleString()}`, margin: [0, 0, 0, 5] }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Patient Information
      {
        text: 'PATIENT INFORMATION',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: `Full Name: ${formData.fullName}`, margin: [0, 0, 0, 5] },
              { text: `Age: ${formData.patientAge || 'Not specified'}`, margin: [0, 0, 0, 5] }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: `Gender: ${formData.patientGender || 'Not specified'}`, margin: [0, 0, 0, 5] },
              { text: `Date of Service: ${formData.dateOfService || currentDate}`, margin: [0, 0, 0, 5] }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Medical Information
      {
        text: 'MEDICAL INFORMATION',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10]
      },
      {
        stack: [
          { text: `Primary Diagnosis: ${formData.diagnosis}`, margin: [0, 0, 0, 5] },
          { text: `ICD-10 Code: ${formData.icdCode}`, margin: [0, 0, 0, 5] }
        ],
        margin: [0, 0, 0, 20]
      }
    ],
    
    styles: {
      header: {
        fontSize: 18,
        bold: true
      },
      headerRight: {
        fontSize: 10,
        alignment: 'right'
      },
      title: {
        fontSize: 16,
        bold: true,
        color: template.headerColor
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: template.headerColor,
        decoration: 'underline'
      }
    }
  };
  
  // Add services table if provided
  if (formData.requestedServices && formData.requestedServices.length > 0) {
    (docDefinition.content as any[]).push(
      {
        text: 'SERVICES PROVIDED',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['Service', 'Code', 'Qty', 'Unit Cost (KES)', 'Total (KES)'],
            ...formData.requestedServices.map(service => [
              service.serviceName,
              service.serviceCode,
              service.quantity.toString(),
              service.unitCost.toLocaleString(),
              service.totalCost.toLocaleString()
            ]),
            ['', '', '', 'TOTAL:', totalAmount.toLocaleString()]
          ]
        },
        layout: {
          fillColor: function (rowIndex: number) {
            return rowIndex === 0 ? '#f3f4f6' : null;
          }
        },
        margin: [0, 0, 0, 20]
      }
    );
  }
  
  // Add provider information
  if (formData.providerName) {
    (docDefinition.content as any[]).push(
      {
        text: 'PROVIDER INFORMATION',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10]
      },
      {
        columns: [
          {
            width: '50%',
            text: `Provider Name: ${formData.providerName}`
          },
          {
            width: '50%',
            text: `Provider Code: ${formData.providerCode || 'Not specified'}`
          }
        ],
        margin: [0, 0, 0, 20]
      }
    );
  }
  
  // Add signature section
  (docDefinition.content as any[]).push(
    {
      text: 'AUTHORIZATION',
      style: 'sectionHeader',
      margin: [0, 20, 0, 10]
    },
    {
      columns: [
        {
          width: '50%',
          stack: [
            { text: 'Patient/Guardian Signature:', margin: [0, 0, 0, 20] },
            { text: '_'.repeat(30), margin: [0, 0, 0, 5] },
            { text: `Date: ${currentDate}`, fontSize: 10 }
          ]
        },
        {
          width: '50%',
          stack: [
            { text: 'Healthcare Provider Signature:', margin: [0, 0, 0, 20] },
            { text: '_'.repeat(30), margin: [0, 0, 0, 5] },
            { text: `Date: ${currentDate}`, fontSize: 10 }
          ]
        }
      ]
    }
  );
  
  // Generate PDF
  const pdfDoc = PDFMake.createPdf(docDefinition);
  
  // Create temp directory if it doesn't exist
  const tempDir = path.join(process.cwd(), 'temp');
  await fs.mkdir(tempDir, { recursive: true });
  
  // Generate unique filename
  const filename = `claim-${claimNumber}-${Date.now()}.pdf`;
  const filePath = path.join(tempDir, filename);
  
  // Save PDF to file
  return new Promise((resolve, reject) => {
    pdfDoc.getBuffer((buffer) => {
      fs.writeFile(filePath, buffer)
        .then(() => resolve(filePath))
        .catch(reject);
    });
  });
}

// Utility function to validate required fields
export function validateClaimData(template: FormTemplate, formData: ClaimFormData): string[] {
  const errors: string[] = [];
  
  for (const field of template.requiredFields) {
    if (!formData[field as keyof ClaimFormData]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  return errors;
}