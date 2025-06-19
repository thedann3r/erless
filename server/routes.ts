import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { authService } from "./auth-service";
import { z } from "zod";
import { insertClaimSchema, insertPreauthorizationSchema, insertPrescriptionSchema } from "@shared/schema";
import { analyzePreauthorization, analyzeFraudPatterns, validatePrescription, suggestClaimCodes } from "./openai";
import { registrationService } from "./registration-service";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Registration validation endpoint
  app.post("/api/register/validate-role", async (req, res) => {
    try {
      const { email, registrationNumber, role, country } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Detect care provider and role from domain
      const domainResult = await authService.detectFromDomain(email);
      
      let registrationResult = null;
      if (registrationNumber && role) {
        registrationResult = await authService.validateRegistration(registrationNumber, role, country || 'kenya');
      }

      res.json({
        domain: domainResult,
        registration: registrationResult,
        roleOptions: authService.getRoleOptions(),
        cadreOptions: role ? authService.getCadreOptions(role) : []
      });
    } catch (error) {
      console.error('Role validation error:', error);
      res.status(500).json({ error: "Failed to validate role and domain" });
    }
  });

  // Get care providers endpoint
  app.get("/api/care-providers", async (req, res) => {
    try {
      const providers = await authService.getAllCareProviders();
      res.json(providers);
    } catch (error) {
      console.error('Error fetching care providers:', error);
      res.status(500).json({ error: "Failed to fetch care providers" });
    }
  });

  // Get role options endpoint
  app.get("/api/roles", (req, res) => {
    const { role } = req.query;
    
    if (role) {
      res.json({
        cadreOptions: authService.getCadreOptions(role as string)
      });
    } else {
      res.json({
        roleOptions: authService.getRoleOptions()
      });
    }
  });

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
        details: { method: biometricHash ? "biometric" : "manual", patientId: patient.patientId },
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
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

  // Professional License Verification API
  app.post("/api/verify-registration", async (req, res) => {
    try {
      const { registrationNumber, cadre } = req.body;

      if (!registrationNumber) {
        return res.status(400).json({
          error: "Registration number is required",
          isValid: false
        });
      }

      const verificationResult = await registrationService.verifyRegistration({
        registrationNumber,
        cadre
      });

      if (!verificationResult.isValid) {
        return res.status(403).json({
          error: verificationResult.error,
          isValid: false
        });
      }

      res.json({
        isValid: true,
        practitioner: verificationResult.practitioner
      });

    } catch (error) {
      console.error("Registration verification error:", error);
      res.status(500).json({
        error: "Verification service temporarily unavailable",
        isValid: false
      });
    }
  });

  // Get registration boards
  app.get("/api/registration/boards", async (req, res) => {
    try {
      const boards = await registrationService.getAllBoards();
      res.json({ boards });
    } catch (error) {
      console.error("Failed to get boards:", error);
      res.status(500).json({ error: "Failed to retrieve board information" });
    }
  });

  // Get registration statistics
  app.get("/api/registration/statistics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const stats = await registrationService.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Failed to get registration statistics:", error);
      res.status(500).json({ error: "Failed to retrieve statistics" });
    }
  });

  // Search practitioners
  app.get("/api/registration/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { name, facility, cadre, board, status } = req.query;
      const searchQuery = {
        name: name as string,
        facility: facility as string,
        cadre: cadre as string,
        board: board as string,
        status: status as string
      };

      const results = await registrationService.searchPractitioners(searchQuery);
      res.json({ practitioners: results });
    } catch (error) {
      console.error("Practitioner search error:", error);
      res.status(500).json({ error: "Search service temporarily unavailable" });
    }
  });

  // Cost Comparison Analytics API
  app.get("/api/analytics/cost-metrics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { timeRange, category, region } = req.query;
      
      // Simulate real-time cost metrics calculation
      const metrics = {
        totalCosts: 2847500 + Math.floor(Math.random() * 500000),
        avgCostPerClaim: 3250 + Math.floor(Math.random() * 500),
        costTrend: (Math.random() - 0.5) * 20, // -10% to +10%
        topCostDrivers: [
          { category: "Inpatient Care", amount: 1420000, percentage: 49.9 },
          { category: "Specialist Consultations", amount: 568000, percentage: 19.9 },
          { category: "Diagnostic Imaging", amount: 341000, percentage: 12.0 },
          { category: "Laboratory Tests", amount: 284000, percentage: 10.0 },
          { category: "Emergency Services", amount: 234500, percentage: 8.2 }
        ]
      };
      
      res.json(metrics);
    } catch (error) {
      console.error("Cost metrics error:", error);
      res.status(500).json({ error: "Failed to retrieve cost metrics" });
    }
  });

  app.get("/api/analytics/provider-comparison", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { timeRange, category } = req.query;
      
      const providers = [
        {
          providerId: "P001",
          providerName: "Kenyatta National Hospital",
          providerType: "Public Hospital",
          totalClaims: 1250 + Math.floor(Math.random() * 200),
          totalCosts: 4875000 + Math.floor(Math.random() * 500000),
          avgCostPerClaim: 3900 + Math.floor(Math.random() * 300),
          costEfficiencyRank: 3,
          specialtyFocus: "General Medicine",
          qualityScore: 87,
          patientSatisfaction: 78
        },
        {
          providerId: "P002",
          providerName: "Aga Khan University Hospital",
          providerType: "Private Hospital",
          totalClaims: 890 + Math.floor(Math.random() * 150),
          totalCosts: 3560000 + Math.floor(Math.random() * 400000),
          avgCostPerClaim: 4000 + Math.floor(Math.random() * 400),
          costEfficiencyRank: 4,
          specialtyFocus: "Specialist Care",
          qualityScore: 94,
          patientSatisfaction: 92
        },
        {
          providerId: "P003",
          providerName: "Nairobi Hospital",
          providerType: "Private Hospital",
          totalClaims: 756 + Math.floor(Math.random() * 120),
          totalCosts: 2268000 + Math.floor(Math.random() * 300000),
          avgCostPerClaim: 3000 + Math.floor(Math.random() * 250),
          costEfficiencyRank: 1,
          specialtyFocus: "Cardiology",
          qualityScore: 91,
          patientSatisfaction: 89
        },
        {
          providerId: "P004",
          providerName: "MP Shah Hospital",
          providerType: "Private Hospital",
          totalClaims: 623 + Math.floor(Math.random() * 100),
          totalCosts: 2180500 + Math.floor(Math.random() * 250000),
          avgCostPerClaim: 3500 + Math.floor(Math.random() * 300),
          costEfficiencyRank: 2,
          specialtyFocus: "Maternity Care",
          qualityScore: 88,
          patientSatisfaction: 85
        },
        {
          providerId: "P005",
          providerName: "Mater Hospital",
          providerType: "Private Hospital",
          totalClaims: 445 + Math.floor(Math.random() * 80),
          totalCosts: 1780000 + Math.floor(Math.random() * 200000),
          avgCostPerClaim: 4000 + Math.floor(Math.random() * 350),
          costEfficiencyRank: 5,
          specialtyFocus: "Pediatrics",
          qualityScore: 90,
          patientSatisfaction: 87
        }
      ];
      
      res.json(providers);
    } catch (error) {
      console.error("Provider comparison error:", error);
      res.status(500).json({ error: "Failed to retrieve provider comparison data" });
    }
  });

  app.get("/api/analytics/service-comparison", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const services = [
        {
          serviceCode: "99213",
          serviceName: "Office Visit - Established Patient",
          category: "Primary Care",
          minCost: 1500,
          maxCost: 4500,
          avgCost: 2750 + Math.floor(Math.random() * 200),
          medianCost: 2600,
          standardDeviation: 650,
          providerCount: 45,
          claimVolume: 2340 + Math.floor(Math.random() * 100)
        },
        {
          serviceCode: "99285",
          serviceName: "Emergency Department Visit - High Complexity",
          category: "Emergency Care",
          minCost: 8000,
          maxCost: 25000,
          avgCost: 15500 + Math.floor(Math.random() * 1000),
          medianCost: 14000,
          standardDeviation: 4200,
          providerCount: 12,
          claimVolume: 567 + Math.floor(Math.random() * 50)
        },
        {
          serviceCode: "73030",
          serviceName: "X-Ray Shoulder",
          category: "Diagnostic Imaging",
          minCost: 2500,
          maxCost: 8000,
          avgCost: 4250 + Math.floor(Math.random() * 300),
          medianCost: 4000,
          standardDeviation: 1100,
          providerCount: 28,
          claimVolume: 890 + Math.floor(Math.random() * 80)
        },
        {
          serviceCode: "80053",
          serviceName: "Comprehensive Metabolic Panel",
          category: "Laboratory",
          minCost: 800,
          maxCost: 2500,
          avgCost: 1400 + Math.floor(Math.random() * 150),
          medianCost: 1300,
          standardDeviation: 380,
          providerCount: 35,
          claimVolume: 1560 + Math.floor(Math.random() * 120)
        }
      ];
      
      res.json(services);
    } catch (error) {
      console.error("Service comparison error:", error);
      res.status(500).json({ error: "Failed to retrieve service comparison data" });
    }
  });

  app.get("/api/analytics/regional-costs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const regions = [
        { 
          region: "Nairobi", 
          avgCost: 3800 + Math.floor(Math.random() * 200), 
          claimVolume: 4567 + Math.floor(Math.random() * 200), 
          providerCount: 45, 
          costTrend: (Math.random() - 0.5) * 10 
        },
        { 
          region: "Mombasa", 
          avgCost: 3200 + Math.floor(Math.random() * 150), 
          claimVolume: 2890 + Math.floor(Math.random() * 150), 
          providerCount: 28, 
          costTrend: (Math.random() - 0.5) * 8 
        },
        { 
          region: "Kisumu", 
          avgCost: 2850 + Math.floor(Math.random() * 120), 
          claimVolume: 1780 + Math.floor(Math.random() * 100), 
          providerCount: 18, 
          costTrend: (Math.random() - 0.5) * 6 
        },
        { 
          region: "Nakuru", 
          avgCost: 2950 + Math.floor(Math.random() * 130), 
          claimVolume: 1456 + Math.floor(Math.random() * 80), 
          providerCount: 15, 
          costTrend: (Math.random() - 0.5) * 7 
        },
        { 
          region: "Eldoret", 
          avgCost: 2700 + Math.floor(Math.random() * 100), 
          claimVolume: 1234 + Math.floor(Math.random() * 60), 
          providerCount: 12, 
          costTrend: (Math.random() - 0.5) * 5 
        }
      ];
      
      res.json(regions);
    } catch (error) {
      console.error("Regional costs error:", error);
      res.status(500).json({ error: "Failed to retrieve regional cost data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
