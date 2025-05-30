import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertClaimSchema, insertPreauthorizationSchema, insertPrescriptionSchema } from "@shared/schema";
import { analyzePreauthorization, analyzeFraudPatterns, validatePrescription, suggestClaimCodes } from "./openai";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Claims routes
  app.get("/api/claims", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const claims = await storage.getAllClaims();
      res.json(claims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  });

  app.get("/api/claims/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const claim = await storage.getClaimById(parseInt(req.params.id));
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      res.json(claim);
    } catch (error) {
      console.error("Error fetching claim:", error);
      res.status(500).json({ message: "Failed to fetch claim" });
    }
  });

  app.post("/api/claims", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const claimData = insertClaimSchema.parse({
        ...req.body,
        submittedBy: req.user!.id,
        claimId: `CLM-${Date.now()}`,
        status: 'pending'
      });
      
      const claim = await storage.createClaim(claimData);
      
      // Trigger blockchain anchoring (simulated)
      if (claim.id) {
        const txHash = `0x${Math.random().toString(16).substr(2, 40)}`;
        await storage.updateClaimBlockchainHash(claim.id, txHash);
      }
      
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating claim:", error);
      res.status(500).json({ message: "Failed to create claim" });
    }
  });

  app.patch("/api/claims/:id/void", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { reason } = req.body;
    
    try {
      const claim = await storage.voidClaim(parseInt(req.params.id), req.user!.id, reason);
      res.json(claim);
    } catch (error) {
      console.error("Error voiding claim:", error);
      res.status(500).json({ message: "Failed to void claim" });
    }
  });

  // Patient routes
  app.get("/api/patients", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const patient = await storage.getPatientById(parseInt(req.params.id));
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const benefits = await storage.getPatientBenefits(patient.id);
      const dependents = await storage.getPatientDependents(patient.id);
      
      res.json({ ...patient, benefits, dependents });
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients/verify", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { patientId, biometricHash, otp } = req.body;
    
    try {
      let patient;
      
      if (biometricHash) {
        // Simulated biometric verification
        patient = await storage.getPatientByBiometric(biometricHash);
      } else if (patientId) {
        patient = await storage.getPatientByPatientId(patientId);
      }
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found or verification failed" });
      }
      
      const benefits = await storage.getPatientBenefits(patient.id);
      const dependents = await storage.getPatientDependents(patient.id);
      
      // Log verification for audit
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "patient_verification",
        resourceType: "patient",
        resourceId: patient.id.toString(),
        details: { method: biometricHash ? "biometric" : "manual", patientId: patient.patientId }
      });
      
      res.json({ ...patient, benefits, dependents });
    } catch (error) {
      console.error("Error verifying patient:", error);
      res.status(500).json({ message: "Failed to verify patient" });
    }
  });

  // AI Preauthorization routes
  app.post("/api/preauth", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const requestData = insertPreauthorizationSchema.parse({
        ...req.body,
        requestedBy: req.user!.id,
      });
      
      // Get patient history for AI analysis
      const patient = await storage.getPatientById(requestData.patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const patientHistory = await storage.getPatientClaimHistory(requestData.patientId);
      const benefits = await storage.getPatientBenefits(requestData.patientId);
      
      // AI Analysis
      const aiResponse = await analyzePreauthorization({
        patientId: requestData.patientId,
        serviceType: requestData.serviceType,
        clinicalJustification: requestData.clinicalJustification,
        estimatedCost: parseFloat(requestData.estimatedCost.toString()),
        urgency: requestData.urgency,
        patientHistory,
        policyData: benefits
      });
      
      const preauth = await storage.createPreauthorization({
        ...requestData,
        aiDecision: aiResponse.decision,
        aiConfidence: aiResponse.confidence,
        aiReasoning: aiResponse,
        humanReviewRequired: aiResponse.decision === 'review' || aiResponse.confidence < 80
      });
      
      res.status(201).json(preauth);
    } catch (error) {
      console.error("Error processing preauthorization:", error);
      res.status(500).json({ message: "Failed to process preauthorization" });
    }
  });

  app.get("/api/preauth", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const preauths = await storage.getAllPreauthorizations();
      res.json(preauths);
    } catch (error) {
      console.error("Error fetching preauthorizations:", error);
      res.status(500).json({ message: "Failed to fetch preauthorizations" });
    }
  });

  // Pharmacy validation routes
  app.post("/api/pharmacy/validate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { patientId, ...prescriptionData } = req.body;
      
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Calculate patient age
      const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      // Get current medications
      const currentMeds = await storage.getPatientMedications(patientId);
      
      const validationResult = await validatePrescription({
        medicationName: prescriptionData.medicationName,
        dosage: prescriptionData.dosage,
        frequency: prescriptionData.frequency,
        patientAge: age,
        patientWeight: prescriptionData.patientWeight,
        patientGender: patient.gender,
        indication: prescriptionData.indication,
        currentMedications: currentMeds.map(med => med.medicationName)
      });
      
      res.json(validationResult);
    } catch (error) {
      console.error("Error validating prescription:", error);
      res.status(500).json({ message: "Failed to validate prescription" });
    }
  });

  app.post("/api/pharmacy/prescriptions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const prescriptionData = insertPrescriptionSchema.parse({
        ...req.body,
        prescribedBy: req.user!.id,
      });
      
      const prescription = await storage.createPrescription(prescriptionData);
      res.status(201).json(prescription);
    } catch (error) {
      console.error("Error creating prescription:", error);
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });

  // Analytics and reporting routes
  app.get("/api/analytics/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/analytics/fraud", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const fraudAlerts = await storage.getFraudAlerts();
      res.json(fraudAlerts);
    } catch (error) {
      console.error("Error fetching fraud alerts:", error);
      res.status(500).json({ message: "Failed to fetch fraud alerts" });
    }
  });

  // Provider routes
  app.get("/api/providers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const providers = await storage.getAllProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  // Code suggestion route
  app.post("/api/ai/suggest-codes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { serviceDescription, diagnosis } = req.body;
    
    try {
      const suggestions = await suggestClaimCodes(serviceDescription, diagnosis);
      res.json(suggestions);
    } catch (error) {
      console.error("Error suggesting codes:", error);
      res.status(500).json({ message: "Failed to suggest codes" });
    }
  });

  // Blockchain simulation routes
  app.post("/api/blockchain/anchor", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { claimId, claimHash } = req.body;
    
    try {
      // Simulate blockchain transaction
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const blockNumber = Math.floor(Math.random() * 1000000) + 4000000;
      
      const result = {
        txHash,
        blockNumber,
        gasUsed: 21000,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      };
      
      // Update claim with blockchain hash
      if (claimId) {
        await storage.updateClaimBlockchainHash(parseInt(claimId), txHash);
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error anchoring to blockchain:", error);
      res.status(500).json({ message: "Failed to anchor to blockchain" });
    }
  });

  app.get("/api/blockchain/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Simulate blockchain network status
    const status = {
      network: "Sepolia Testnet",
      gasPrice: Math.floor(Math.random() * 20) + 10,
      lastBlock: Math.floor(Math.random() * 1000000) + 4000000,
      contractAddress: "0x742d35Cc6634C0532925a3b8D42d4738A12F9B2e",
      isOnline: true
    };
    
    res.json(status);
  });

  const httpServer = createServer(app);
  return httpServer;
}
