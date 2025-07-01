import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";

export interface PatientData {
  name: string;
  dateOfBirth: string;
  gender: string;
  memberId: string;
  phoneNumber?: string;
  address?: string;
  diagnosis?: string;
  treatment?: string;
  serviceDate?: string;
  providerName?: string;
  totalAmount?: string;
}

export interface ClaimService {
  serviceCode: string;
  serviceName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  serviceDate: string;
}

export async function generateClaimForm(
  patientData: PatientData, 
  insurer: string,
  services: ClaimService[] = []
): Promise<Uint8Array> {
  try {
    // Create a new PDF document for claim forms
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    const { width, height } = page.getSize();
    const fontSize = 10;
    const titleFontSize = 14;
    const headerFontSize = 12;

    // Header with insurer branding
    const headerY = height - 50;
    page.drawText(`${insurer.toUpperCase()} MEDICAL CLAIM FORM`, {
      x: 50,
      y: headerY,
      size: titleFontSize,
    });

    page.drawText(`Claim Date: ${new Date().toLocaleDateString()}`, {
      x: width - 200,
      y: headerY,
      size: fontSize,
    });

    // Patient Information Section
    let currentY = headerY - 60;
    page.drawText('PATIENT INFORMATION', {
      x: 50,
      y: currentY,
      size: headerFontSize,
    });

    currentY -= 30;
    const leftColumn = 50;
    const rightColumn = 300;

    // Patient details
    page.drawText(`Name: ${patientData.name}`, {
      x: leftColumn,
      y: currentY,
      size: fontSize,
    });

    page.drawText(`Member ID: ${patientData.memberId}`, {
      x: rightColumn,
      y: currentY,
      size: fontSize,
    });

    currentY -= 20;
    page.drawText(`Date of Birth: ${patientData.dateOfBirth}`, {
      x: leftColumn,
      y: currentY,
      size: fontSize,
    });

    page.drawText(`Gender: ${patientData.gender}`, {
      x: rightColumn,
      y: currentY,
      size: fontSize,
    });

    if (patientData.phoneNumber) {
      currentY -= 20;
      page.drawText(`Phone: ${patientData.phoneNumber}`, {
        x: leftColumn,
        y: currentY,
        size: fontSize,
      });
    }

    if (patientData.address) {
      page.drawText(`Address: ${patientData.address}`, {
        x: rightColumn,
        y: currentY,
        size: fontSize,
      });
    }

    // Medical Information Section
    currentY -= 50;
    page.drawText('MEDICAL INFORMATION', {
      x: 50,
      y: currentY,
      size: headerFontSize,
    });

    currentY -= 30;
    if (patientData.diagnosis) {
      page.drawText(`Diagnosis: ${patientData.diagnosis}`, {
        x: leftColumn,
        y: currentY,
        size: fontSize,
      });
      currentY -= 20;
    }

    if (patientData.treatment) {
      page.drawText(`Treatment: ${patientData.treatment}`, {
        x: leftColumn,
        y: currentY,
        size: fontSize,
      });
      currentY -= 20;
    }

    if (patientData.serviceDate) {
      page.drawText(`Service Date: ${patientData.serviceDate}`, {
        x: leftColumn,
        y: currentY,
        size: fontSize,
      });
      currentY -= 20;
    }

    // Services Table
    if (services.length > 0) {
      currentY -= 30;
      page.drawText('SERVICES PROVIDED', {
        x: 50,
        y: currentY,
        size: headerFontSize,
      });

      currentY -= 30;
      // Table header
      page.drawText('Service Code', { x: 50, y: currentY, size: fontSize });
      page.drawText('Description', { x: 130, y: currentY, size: fontSize });
      page.drawText('Qty', { x: 300, y: currentY, size: fontSize });
      page.drawText('Unit Cost', { x: 350, y: currentY, size: fontSize });
      page.drawText('Total', { x: 420, y: currentY, size: fontSize });
      page.drawText('Date', { x: 480, y: currentY, size: fontSize });

      // Draw line under header
      currentY -= 5;
      page.drawLine({
        start: { x: 50, y: currentY },
        end: { x: 550, y: currentY },
        thickness: 1,
      });

      // Service rows
      let totalAmount = 0;
      services.forEach((service) => {
        currentY -= 20;
        page.drawText(service.serviceCode, { x: 50, y: currentY, size: fontSize });
        page.drawText(service.serviceName.substring(0, 20), { x: 130, y: currentY, size: fontSize });
        page.drawText(service.quantity.toString(), { x: 300, y: currentY, size: fontSize });
        page.drawText(`KES ${service.unitCost.toFixed(2)}`, { x: 350, y: currentY, size: fontSize });
        page.drawText(`KES ${service.totalCost.toFixed(2)}`, { x: 420, y: currentY, size: fontSize });
        page.drawText(service.serviceDate, { x: 480, y: currentY, size: fontSize });
        totalAmount += service.totalCost;
      });

      // Total line
      currentY -= 25;
      page.drawLine({
        start: { x: 350, y: currentY + 15 },
        end: { x: 480, y: currentY + 15 },
        thickness: 1,
      });
      page.drawText(`TOTAL: KES ${totalAmount.toFixed(2)}`, {
        x: 420,
        y: currentY,
        size: headerFontSize,
      });
    }

    // Provider Information
    currentY -= 50;
    page.drawText('PROVIDER INFORMATION', {
      x: 50,
      y: currentY,
      size: headerFontSize,
    });

    currentY -= 30;
    if (patientData.providerName) {
      page.drawText(`Provider: ${patientData.providerName}`, {
        x: leftColumn,
        y: currentY,
        size: fontSize,
      });
    }

    page.drawText(`Facility: Erlessed Healthcare Platform`, {
      x: rightColumn,
      y: currentY,
      size: fontSize,
    });

    // Signature section
    currentY -= 50;
    page.drawText('SIGNATURES', {
      x: 50,
      y: currentY,
      size: headerFontSize,
    });

    currentY -= 40;
    page.drawText('Patient/Guardian Signature: ________________________', {
      x: 50,
      y: currentY,
      size: fontSize,
    });

    page.drawText('Date: __________', {
      x: 400,
      y: currentY,
      size: fontSize,
    });

    currentY -= 30;
    page.drawText('Provider Signature: ____________________________', {
      x: 50,
      y: currentY,
      size: fontSize,
    });

    page.drawText('Date: __________', {
      x: 400,
      y: currentY,
      size: fontSize,
    });

    // Footer
    page.drawText(`Generated by Erlessed Healthcare Platform - ${new Date().toISOString()}`, {
      x: 50,
      y: 30,
      size: 8,
    });

    // Insurer-specific customizations
    if (insurer.toLowerCase() === 'sha') {
      page.drawText('SHA Member Benefits Apply', {
        x: width - 200,
        y: 50,
        size: fontSize,
      });
    } else if (insurer.toLowerCase() === 'cic') {
      page.drawText('CIC Insurance Policy Coverage', {
        x: width - 200,
        y: 50,
        size: fontSize,
      });
    } else if (insurer.toLowerCase() === 'aar') {
      page.drawText('AAR Insurance Medical Cover', {
        x: width - 200,
        y: 50,
        size: fontSize,
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error('Error generating claim form:', error);
    throw new Error('Failed to generate claim form');
  }
}

// Helper function to download the generated PDF
export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate filename based on patient and insurer data
export function generateFilename(patientData: PatientData, insurer: string): string {
  const date = new Date().toISOString().split('T')[0];
  const sanitizedName = patientData.name.replace(/[^a-zA-Z0-9]/g, '_');
  return `${insurer}_Claim_${sanitizedName}_${date}.pdf`;
}