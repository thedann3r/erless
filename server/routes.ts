import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { aiService } from "./ai";
import { insertClaimSchema, insertPreauthorizationSchema, insertPrescriptionSchema, insertVerificationLogSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

// Blockchain simulation (Sepolia testnet)
interface BlockchainService {
  anchorClaim(claimData: any): Promise<{ txHash: string; blockNumber: number; gasUsed: number }>;
  verifyTransaction(txHash: string): Promise<{ verified: boolean; blockNumber: number; timestamp: number }>;
}

const blockchainService: BlockchainService = {
  async anchorClaim(claimData: any) {
    // Simulate blockchain transaction to Sepolia testnet
    const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;
    const blockNumber = Math.floor(Math.random() * 1000000) + 4000000;
    const gasUsed = 21000 + Math.floor(Math.random() * 50000);
    
    // In a real implementation, this would interact with Ethereum/Sepolia
    return { txHash, blockNumber, gasUsed };
  },
  
  async verifyTransaction(txHash: string) {
    // Simulate transaction verification
    return {
      verified: true,
      blockNumber: Math.floor(Math.random() * 1000000) + 4000000,
      timestamp: Date.now()
    };
  }
};

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Patient verification endpoints
  app.post("/api/verify-patient", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { patientId, verificationType, verificationData } = req.body;
      
      // Simulate biometric verification
      let isSuccessful = false;
      if (verificationType === 'fingerprint') {
        // In real implementation, this would verify against stored biometric hash
        isSuccessful = true; // Simulate successful verification
      } else if (verificationType === 'otp') {
        // In real implementation, this would verify OTP
        isSuccessful = verificationData === '123456'; // Simulate OTP verification
      }
      
      // Log verification attempt
      const log = await storage.createVerificationLog({
        patientId: parseInt(patientId),
        verificationType,
        verificationData: verificationType === 'fingerprint' ? 'BIOMETRIC_HASH' : verificationData,
        isSuccessful,
        verifiedBy: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });
      
      if (isSuccessful) {
        const patient = await storage.getPatient(parseInt(patientId));
        const dependents = await storage.getPatientDependents(parseInt(patientId));
        const benefits = await storage.getPatientBenefits(parseInt(patientId));
        
        // Log activity
        await storage.createActivityLog({
          userId: req.user!.id,
          action: 'patient_verified',
          entityType: 'patient',
          entityId: patientId,
          details: { verificationType },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
        });
        
        res.json({
          success: true,
          patient,
          dependents,
          benefits,
        });
      } else {
        res.status(400).json({ success: false, message: 'Verification failed' });
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/patients/search", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query required' });
      }
      
      // Search by patient ID or name
      let patient = await storage.getPatientByPatientId(q);
      if (!patient) {
        // In a real implementation, this would search by name
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      res.json(patient);
    } catch (error) {
      next(error);
    }
  });

  // Claims processing endpoints
  app.post("/api/claims", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const claimData = insertClaimSchema.parse({
        ...req.body,
        submittedBy: req.user!.id,
        claimId: `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      });
      
      // AI fraud analysis
      const patient = await storage.getPatient(claimData.patientId);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      const patientHistory = {
        previousClaims: [],
        currentMedications: [],
        allergies: [],
        chronicConditions: [],
      };
      
      const fraudAnalysis = await aiService.analyzeClaim({
        serviceType: claimData.serviceType,
        procedureCode: claimData.procedureCode || '',
        diagnosisCode: claimData.diagnosisCode || '',
        cost: parseFloat(claimData.serviceCost.toString()),
        providerId: claimData.providerId.toString(),
        patientAge: new Date().getFullYear() - patient.dateOfBirth.getFullYear(),
        serviceDate: claimData.serviceDate.toISOString(),
      }, patientHistory);
      
      // Update claim with AI analysis
      const updatedClaimData = {
        ...claimData,
        aiDecision: fraudAnalysis.fraudScore > 80 ? 'flagged' : 'approved',
        aiConfidence: fraudAnalysis.confidence,
        aiReasoning: {
          fraudScore: fraudAnalysis.fraudScore,
          anomalies: fraudAnalysis.anomalies,
          recommendations: fraudAnalysis.recommendations,
        },
        status: fraudAnalysis.fraudScore > 80 ? 'pending' : 'approved',
      };
      
      const claim = await storage.createClaim(updatedClaimData);
      
      // Anchor to blockchain if approved
      if (claim.status === 'approved') {
        try {
          const blockchainResult = await blockchainService.anchorClaim({
            claimId: claim.claimId,
            hash: crypto.createHash('sha256').update(JSON.stringify(claim)).digest('hex'),
            amount: claim.serviceCost,
            providerId: claim.providerId,
          });
          
          await storage.updateClaim(claim.id, {
            blockchainTxHash: blockchainResult.txHash,
          });
          
          await storage.createBlockchainTransaction({
            claimId: claim.id,
            contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '0x742d35Cc6634C0532925a3b8D42d4738',
            transactionHash: blockchainResult.txHash,
            blockNumber: blockchainResult.blockNumber,
            gasUsed: blockchainResult.gasUsed,
            gasPrice: '15000000000', // 15 gwei
            status: 'confirmed',
            networkName: 'sepolia',
          });
        } catch (blockchainError) {
          console.error('Blockchain anchoring failed:', blockchainError);
        }
      }
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: 'claim_submitted',
        entityType: 'claim',
        entityId: claim.claimId,
        details: { status: claim.status, fraudScore: fraudAnalysis.fraudScore },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });
      
      res.json(claim);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/claims", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { limit } = req.query;
      const claims = await storage.getRecentClaims(limit ? parseInt(limit as string) : 20);
      res.json(claims);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/claims/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const claim = await storage.getClaim(parseInt(req.params.id));
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }
      
      res.json(claim);
    } catch (error) {
      next(error);
    }
  });

  // AI Preauthorization endpoints
  app.post("/api/preauthorizations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const preauthData = insertPreauthorizationSchema.parse({
        ...req.body,
        requestedBy: req.user!.id,
        requestId: `PA-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      });
      
      // Get patient history for AI analysis
      const patient = await storage.getPatient(preauthData.patientId);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      const patientHistory = {
        previousClaims: [],
        currentMedications: [],
        allergies: [],
        chronicConditions: [],
      };
      
      const policyData = {
        coverageDetails: { type: patient.insurancePlan },
        benefitLimits: { consultation: 12, lab: 500, pharmacy: 1000 },
        exclusions: ['cosmetic', 'experimental'],
      };
      
      // AI preauthorization decision
      const aiDecision = await aiService.processPreauthorization({
        treatmentDescription: preauthData.treatmentDescription,
        clinicalJustification: preauthData.clinicalJustification,
        estimatedCost: parseFloat(preauthData.estimatedCost.toString()),
        urgency: preauthData.urgency as 'routine' | 'urgent' | 'emergency',
      }, patientHistory, policyData);
      
      const updatedPreauthData = {
        ...preauthData,
        aiDecision: aiDecision.decision,
        aiConfidence: aiDecision.confidence,
        chainOfThought: aiDecision.chainOfThought,
        ragContext: aiDecision.ragContext,
        humanReviewRequired: aiDecision.decision === 'review_required',
        status: aiDecision.decision === 'approved' ? 'approved' : 'pending',
      };
      
      const preauth = await storage.createPreauthorization(updatedPreauthData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: 'preauthorization_requested',
        entityType: 'preauthorization',
        entityId: preauth.requestId,
        details: { decision: aiDecision.decision, confidence: aiDecision.confidence },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });
      
      res.json(preauth);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/preauthorizations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { limit } = req.query;
      const preauths = await storage.getRecentPreauthorizations(limit ? parseInt(limit as string) : 20);
      res.json(preauths);
    } catch (error) {
      next(error);
    }
  });

  // Pharmacy validation endpoints
  app.post("/api/prescriptions/validate", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { patientId, medicationName, dosage, frequency, indication, patientWeight, gender } = req.body;
      
      const patient = await storage.getPatient(parseInt(patientId));
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      const patientHistory = {
        previousClaims: [],
        currentMedications: [],
        allergies: [],
        chronicConditions: [],
      };
      
      const validation = await aiService.validatePrescription({
        medicationName,
        dosage,
        frequency,
        patientAge: new Date().getFullYear() - patient.dateOfBirth.getFullYear(),
        patientWeight: patientWeight ? parseFloat(patientWeight) : undefined,
        gender,
        indication,
      }, patientHistory);
      
      res.json(validation);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/prescriptions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const prescriptionData = insertPrescriptionSchema.parse({
        ...req.body,
        prescribedBy: req.user!.id,
        prescriptionId: `RX-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      });
      
      const prescription = await storage.createPrescription(prescriptionData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: 'prescription_created',
        entityType: 'prescription',
        entityId: prescription.prescriptionId,
        details: { medication: prescription.medicationName, cost: prescription.cost },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });
      
      res.json(prescription);
    } catch (error) {
      next(error);
    }
  });

  // AI code suggestions
  app.post("/api/ai/suggest-codes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { serviceDescription, clinicalContext } = req.body;
      
      const suggestions = await aiService.suggestCodes(serviceDescription, clinicalContext || '');
      res.json(suggestions);
    } catch (error) {
      next(error);
    }
  });

  // Blockchain endpoints
  app.post("/api/blockchain/anchor", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { claimId, claimHash, amount, providerId } = req.body;
      
      const result = await blockchainService.anchorClaim({
        claimId,
        hash: claimHash,
        amount,
        providerId,
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/blockchain/verify/:txHash", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const verification = await blockchainService.verifyTransaction(req.params.txHash);
      res.json(verification);
    } catch (error) {
      next(error);
    }
  });

  // Dashboard analytics
  app.get("/api/dashboard/stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/activity", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { limit } = req.query;
      const activity = await storage.getRecentActivity(limit ? parseInt(limit as string) : 20);
      res.json(activity);
    } catch (error) {
      next(error);
    }
  });

  // Provider endpoints
  app.get("/api/providers", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const providers = await storage.getAllProviders();
      res.json(providers);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
