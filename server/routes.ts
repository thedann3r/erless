import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { createSimpleUsers } from "./create-simple-users";
import { authService } from "./auth-service";
import { z } from "zod";
import { insertClaimSchema, insertPreauthorizationSchema, insertPrescriptionSchema } from "@shared/schema";
import { analyzePreauthorization, analyzeFraudPatterns, validatePrescription, suggestClaimCodes } from "./openai";
import { DeepSeekService } from "./deepseek";
import { mistralHealthcareService } from "./mistral";

const deepSeekService = new DeepSeekService();
import { registrationService } from "./registration-service";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    next();
  };

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Session cleanup failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

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
      
      // Enhanced Claims Validation with DeepSeek
      let aiResponse;
      try {
        // Use structured claims validation for comprehensive analysis
        const claimsValidation = await deepSeekService.validateInsuranceClaim({
          fullName: patient.name,
          age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
          sex: patient.gender,
          diagnosis: requestData.serviceType,
          icdCode: requestData.icdCode || 'Not specified',
          serviceName: requestData.clinicalJustification,
          procedureCode: requestData.cptCode || 'Not specified',
          planName: benefits?.length > 0 ? benefits[0].planType : 'Standard Plan',
          insurerName: benefits?.length > 0 ? benefits[0].schemeName : 'Standard Coverage'
        });
        
        // Also run traditional preauthorization analysis for additional context
        const deepSeekAnalysis = await deepSeekService.analyzePreauthorization({
          patientId: requestData.patientId.toString(),
          diagnosis: requestData.serviceType,
          treatmentPlan: requestData.clinicalJustification,
          medicalHistory: patientHistory ? JSON.stringify(patientHistory) : undefined,
          insuranceScheme: benefits?.length > 0 ? benefits[0].schemeName : 'Standard Coverage',
          cost: parseFloat(requestData.estimatedCost.toString())
        });
        
        aiResponse = {
          decision: claimsValidation.decision.toLowerCase(),
          confidence: claimsValidation.confidence,
          reasoning: [...claimsValidation.reasoning, ...deepSeekAnalysis.reasoning],
          conditions: deepSeekAnalysis.conditions,
          chainOfThought: true,
          claimsValidation: {
            decision: claimsValidation.decision,
            reason: claimsValidation.reason,
            confidence: claimsValidation.confidence
          }
        };
      } catch (error) {
        console.error('DeepSeek analysis failed, using fallback:', error);
        // Fallback to existing OpenAI analysis
        aiResponse = await analyzePreauthorization({
          patientId: requestData.patientId,
          serviceType: requestData.serviceType,
          clinicalJustification: requestData.clinicalJustification,
          estimatedCost: parseFloat(requestData.estimatedCost.toString()),
          urgency: requestData.urgency,
          patientHistory,
          policyData: benefits
        });
        aiResponse.chainOfThought = false;
      }
      
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
      
      // DeepSeek Chain of Thought Prescription Validation
      let validationResult;
      try {
        const safetyAnalysis = await deepSeekService.analyzePrescriptionSafety(
          patientId,
          [prescriptionData.medicationName],
          age,
          prescriptionData.patientWeight || 70, // Default weight if not provided
          patient.allergies ? JSON.parse(patient.allergies) : [],
          patient.conditions ? JSON.parse(patient.conditions) : []
        );
        
        validationResult = {
          ...safetyAnalysis,
          isApproved: safetyAnalysis.safetyScore >= 70,
          chainOfThought: true
        };
      } catch (error) {
        console.error('DeepSeek prescription validation failed, using fallback:', error);
        // Fallback to existing validation
        validationResult = await validatePrescription({
          medicationName: prescriptionData.medicationName,
          dosage: prescriptionData.dosage,
          frequency: prescriptionData.frequency,
          patientAge: age,
          patientWeight: prescriptionData.patientWeight,
          patientGender: patient.gender,
          indication: prescriptionData.indication,
          currentMedications: currentMeds.map(med => med.medicationName)
        });
        validationResult.chainOfThought = false;
      }
      
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

  // Advanced Analytics and Prognosis API
  app.get("/api/analytics/prognosis-models", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const models = [
        {
          modelId: "diabetes-prediction",
          modelName: "Diabetes Progression Predictor",
          condition: "Type 2 Diabetes",
          accuracy: 89.5 + Math.random() * 5,
          lastTrained: "2024-06-15",
          dataPoints: 15400 + Math.floor(Math.random() * 1000),
          status: "active"
        },
        {
          modelId: "cardiovascular-risk",
          modelName: "Cardiovascular Risk Assessment",
          condition: "Heart Disease",
          accuracy: 92.1 + Math.random() * 3,
          lastTrained: "2024-06-10",
          dataPoints: 22100 + Math.floor(Math.random() * 1500),
          status: "active"
        },
        {
          modelId: "cancer-prognosis",
          modelName: "Cancer Treatment Response",
          condition: "Various Cancers",
          accuracy: 87.3 + Math.random() * 4,
          lastTrained: "2024-06-08",
          dataPoints: 8750 + Math.floor(Math.random() * 800),
          status: "active"
        },
        {
          modelId: "mental-health",
          modelName: "Mental Health Outcome Predictor",
          condition: "Depression/Anxiety",
          accuracy: 84.7 + Math.random() * 6,
          lastTrained: "2024-06-12",
          dataPoints: 12600 + Math.floor(Math.random() * 1200),
          status: Math.random() > 0.7 ? "training" : "active"
        }
      ];
      
      res.json(models);
    } catch (error) {
      console.error("Prognosis models error:", error);
      res.status(500).json({ error: "Failed to retrieve prognosis models" });
    }
  });

  app.get("/api/analytics/outcome-tracking", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { condition, timeframe } = req.query;
      
      const outcomes = [
        {
          patientId: "P12345",
          patientName: "John Kamau",
          condition: "Type 2 Diabetes",
          initialDiagnosis: "HbA1c: 8.5%, Fasting glucose: 180mg/dL",
          treatmentPlan: "Metformin + Lifestyle modification",
          predictedOutcome: {
            recoveryProbability: 78 + Math.floor(Math.random() * 15),
            timeToRecovery: 180 + Math.floor(Math.random() * 60),
            riskFactors: ["Obesity", "Family history", "Sedentary lifestyle"],
            confidenceLevel: 89 + Math.floor(Math.random() * 8)
          },
          actualOutcome: {
            status: Math.random() > 0.5 ? "improved" : "stable",
            timeToOutcome: 165 + Math.floor(Math.random() * 30),
            complications: Math.random() > 0.8 ? ["Mild hypoglycemia"] : [],
            followUpRequired: true
          },
          lastUpdated: "2024-06-18"
        },
        {
          patientId: "P12346",
          patientName: "Mary Wanjiku",
          condition: "Hypertension",
          initialDiagnosis: "BP: 165/95 mmHg, Stage 2 HTN",
          treatmentPlan: "ACE inhibitor + Diet modification",
          predictedOutcome: {
            recoveryProbability: 85 + Math.floor(Math.random() * 10),
            timeToRecovery: 90 + Math.floor(Math.random() * 30),
            riskFactors: ["Age >50", "Salt intake", "Stress"],
            confidenceLevel: 92 + Math.floor(Math.random() * 6)
          },
          actualOutcome: {
            status: Math.random() > 0.3 ? "stable" : "improved",
            timeToOutcome: 95 + Math.floor(Math.random() * 20),
            complications: [],
            followUpRequired: true
          },
          lastUpdated: "2024-06-17"
        },
        {
          patientId: "P12347",
          patientName: "Peter Ochieng",
          condition: "Asthma",
          initialDiagnosis: "Moderate persistent asthma, FEV1: 65%",
          treatmentPlan: "ICS/LABA + Action plan",
          predictedOutcome: {
            recoveryProbability: 92 + Math.floor(Math.random() * 6),
            timeToRecovery: 60 + Math.floor(Math.random() * 30),
            riskFactors: ["Environmental triggers", "Compliance"],
            confidenceLevel: 87 + Math.floor(Math.random() * 10)
          },
          lastUpdated: "2024-06-16"
        }
      ];
      
      res.json(outcomes);
    } catch (error) {
      console.error("Outcome tracking error:", error);
      res.status(500).json({ error: "Failed to retrieve outcome tracking data" });
    }
  });

  app.get("/api/analytics/population-trends", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { timeframe } = req.query;
      
      const trends = [
        { 
          timeperiod: "Jan 2024", 
          condition: "Diabetes", 
          incidenceRate: 4.2 + Math.random() * 0.5, 
          mortalityRate: 0.8 + Math.random() * 0.2, 
          recoveryRate: 78 + Math.random() * 5, 
          avgTreatmentCost: 45000 + Math.floor(Math.random() * 5000), 
          riskScore: 6.5 + Math.random() * 0.5 
        },
        { 
          timeperiod: "Feb 2024", 
          condition: "Diabetes", 
          incidenceRate: 4.5 + Math.random() * 0.5, 
          mortalityRate: 0.7 + Math.random() * 0.2, 
          recoveryRate: 79 + Math.random() * 5, 
          avgTreatmentCost: 46000 + Math.floor(Math.random() * 5000), 
          riskScore: 6.3 + Math.random() * 0.5 
        },
        { 
          timeperiod: "Mar 2024", 
          condition: "Diabetes", 
          incidenceRate: 4.1 + Math.random() * 0.5, 
          mortalityRate: 0.6 + Math.random() * 0.2, 
          recoveryRate: 81 + Math.random() * 5, 
          avgTreatmentCost: 44500 + Math.floor(Math.random() * 5000), 
          riskScore: 6.1 + Math.random() * 0.5 
        },
        { 
          timeperiod: "Apr 2024", 
          condition: "Diabetes", 
          incidenceRate: 3.9 + Math.random() * 0.5, 
          mortalityRate: 0.5 + Math.random() * 0.2, 
          recoveryRate: 83 + Math.random() * 5, 
          avgTreatmentCost: 43000 + Math.floor(Math.random() * 5000), 
          riskScore: 5.9 + Math.random() * 0.5 
        },
        { 
          timeperiod: "May 2024", 
          condition: "Diabetes", 
          incidenceRate: 3.7 + Math.random() * 0.5, 
          mortalityRate: 0.5 + Math.random() * 0.2, 
          recoveryRate: 85 + Math.random() * 5, 
          avgTreatmentCost: 42000 + Math.floor(Math.random() * 5000), 
          riskScore: 5.7 + Math.random() * 0.5 
        },
        { 
          timeperiod: "Jun 2024", 
          condition: "Diabetes", 
          incidenceRate: 3.5 + Math.random() * 0.5, 
          mortalityRate: 0.4 + Math.random() * 0.2, 
          recoveryRate: 87 + Math.random() * 5, 
          avgTreatmentCost: 41000 + Math.floor(Math.random() * 5000), 
          riskScore: 5.5 + Math.random() * 0.5 
        }
      ];
      
      res.json(trends);
    } catch (error) {
      console.error("Population trends error:", error);
      res.status(500).json({ error: "Failed to retrieve population trends" });
    }
  });

  app.get("/api/analytics/risk-assessments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const assessments = [
        {
          patientId: "P98765",
          patientName: "Grace Muthoni",
          age: 45,
          gender: "Female",
          riskFactors: [
            { factor: "Hypertension", severity: "medium", impact: 6.5 + Math.random() * 1 },
            { factor: "Family History of CVD", severity: "high", impact: 8.2 + Math.random() * 0.5 },
            { factor: "Smoking", severity: "high", impact: 9.1 + Math.random() * 0.5 },
            { factor: "High Cholesterol", severity: "medium", impact: 6.8 + Math.random() * 0.8 }
          ],
          overallRiskScore: 7.6 + Math.random() * 0.8,
          recommendations: [
            "Smoking cessation program",
            "Cholesterol management",
            "Regular BP monitoring",
            "Cardiology consultation"
          ],
          nextReviewDate: "2024-09-15"
        },
        {
          patientId: "P98766",
          patientName: "Samuel Kiprop",
          age: 38,
          gender: "Male",
          riskFactors: [
            { factor: "Obesity (BMI >30)", severity: "medium", impact: 5.8 + Math.random() * 0.8 },
            { factor: "Sedentary Lifestyle", severity: "medium", impact: 4.9 + Math.random() * 0.7 },
            { factor: "Pre-diabetes", severity: "high", impact: 7.3 + Math.random() * 0.5 }
          ],
          overallRiskScore: 6.0 + Math.random() * 0.8,
          recommendations: [
            "Weight management program",
            "Exercise prescription",
            "Dietary counseling",
            "Regular glucose monitoring"
          ],
          nextReviewDate: "2024-08-20"
        }
      ];
      
      res.json(assessments);
    } catch (error) {
      console.error("Risk assessments error:", error);
      res.status(500).json({ error: "Failed to retrieve risk assessments" });
    }
  });

  // Onboarding API Routes
  app.post("/api/onboarding/submit", async (req, res) => {
    try {
      const formData = req.body;
      
      // Create onboarding record
      const provider = await storage.createOnboardingApplication({
        ...formData,
        onboardingStatus: 'pending',
        onboardingData: formData
      });

      // Log audit trail
      await storage.logOnboardingAudit({
        providerId: provider.id,
        action: 'form_submitted',
        details: { formData },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Send verification email (simulated)
      console.log(`Verification email would be sent to: ${formData.contactEmail}`);

      res.json({ 
        message: 'Onboarding application submitted successfully',
        applicationId: provider.id,
        status: 'pending_verification'
      });
    } catch (error) {
      console.error("Onboarding submission error:", error);
      res.status(500).json({ message: "Failed to submit onboarding application" });
    }
  });

  app.get("/api/onboarding/applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const applications = await storage.getOnboardingApplications();
      res.json(applications);
    } catch (error) {
      console.error("Failed to fetch onboarding applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/onboarding/approve/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      const { users = [] } = req.body;
      
      // Update provider status
      await storage.approveOnboardingApplication(parseInt(id), req.user!.id);
      
      // Create user accounts
      for (const userData of users) {
        await storage.createUser({
          ...userData,
          careProviderId: parseInt(id),
          password: 'temp123', // Temporary password
          isVerified: false
        });
      }

      // Generate sample claim flows
      await storage.generateSampleClaimFlows(parseInt(id));

      // Log approval
      await storage.logOnboardingAudit({
        providerId: parseInt(id),
        action: 'approved',
        actionBy: req.user!.id,
        details: { userCount: users.length },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Application approved successfully' });
    } catch (error) {
      console.error("Approval error:", error);
      res.status(500).json({ message: "Failed to approve application" });
    }
  });

  app.post("/api/onboarding/reject/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      await storage.rejectOnboardingApplication(parseInt(id), req.user!.id, reason);
      
      await storage.logOnboardingAudit({
        providerId: parseInt(id),
        action: 'rejected',
        actionBy: req.user!.id,
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Application rejected' });
    } catch (error) {
      console.error("Rejection error:", error);
      res.status(500).json({ message: "Failed to reject application" });
    }
  });

  app.get("/api/onboarding/sample-flows/:providerId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { providerId } = req.params;
      const flows = await storage.getSampleClaimFlows(parseInt(providerId));
      res.json(flows);
    } catch (error) {
      console.error("Failed to fetch sample flows:", error);
      res.status(500).json({ message: "Failed to fetch sample flows" });
    }
  });

  app.post("/api/onboarding/complete-flow/:flowId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { flowId } = req.params;
      await storage.completeSampleFlow(parseInt(flowId));
      res.json({ message: 'Sample flow completed' });
    } catch (error) {
      console.error("Flow completion error:", error);
      res.status(500).json({ message: "Failed to complete flow" });
    }
  });

  app.get("/api/insurance-policies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const policies = await storage.getInsurancePolicies();
      res.json(policies);
    } catch (error) {
      console.error("Failed to fetch insurance policies:", error);
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  app.post("/api/onboarding/seed-policies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      await storage.seedInsurancePolicies();
      res.json({ message: 'Insurance policies seeded successfully' });
    } catch (error) {
      console.error("Policy seeding error:", error);
      res.status(500).json({ message: "Failed to seed policies" });
    }
  });

  // Dedicated claims validation endpoint
  app.post("/api/claims/validate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const {
        fullName,
        age,
        sex,
        diagnosis,
        icdCode,
        serviceName,
        procedureCode,
        planName,
        insurerName
      } = req.body;
      
      if (!fullName || !diagnosis || !serviceName) {
        return res.status(400).json({ 
          message: "Patient name, diagnosis, and service name are required" 
        });
      }
      
      const validation = await deepSeekService.validateInsuranceClaim({
        fullName,
        age: age || 30,
        sex: sex || 'Unknown',
        diagnosis,
        icdCode: icdCode || 'Not specified',
        serviceName,
        procedureCode: procedureCode || 'Not specified',
        planName: planName || 'Standard Plan',
        insurerName: insurerName || 'Standard Coverage'
      });
      
      // Log the validation for audit
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "claims_validation",
        resourceType: "claim",
        resourceId: null,
        details: { 
          patient: fullName, 
          diagnosis, 
          service: serviceName,
          decision: validation.decision,
          confidence: validation.confidence
        },
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
      });
      
      res.json({
        ...validation,
        timestamp: new Date().toISOString(),
        validatedBy: 'deepseek-claims-validator'
      });
    } catch (error) {
      console.error("Claims validation error:", error);
      res.status(500).json({ message: "Failed to validate claim" });
    }
  });

  // General chain of thought endpoint for any healthcare decision
  app.post("/api/ai/chain-of-thought", async (req, res) => {
    try {
      const { prompt, context, temperature, maxTokens } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      const chainOfThought = await deepSeekService.generateChainOfThought({
        prompt,
        context,
        temperature,
        maxTokens
      });
      
      res.json(chainOfThought);
    } catch (error) {
      console.error('Chain of thought error:', error);
      res.status(500).json({ message: "Chain of thought analysis failed" });
    }
  });

  // Mistral healthcare treatment endpoints
  app.post("/api/ai/treatment-plan", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const treatmentRequest = req.body;
      
      if (!treatmentRequest.diagnosis || !treatmentRequest.patientAge) {
        return res.status(400).json({ message: "Diagnosis and patient age are required" });
      }
      
      const treatmentPlan = await mistralHealthcareService.generateTreatmentPlan(treatmentRequest);
      
      res.json({
        ...treatmentPlan,
        generatedBy: 'mistral-7b',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Treatment plan generation error:', error);
      res.status(500).json({ message: "Failed to generate treatment plan" });
    }
  });

  app.post("/api/ai/differential-diagnosis", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { symptoms, patientAge, patientGender, duration, additionalInfo } = req.body;
      
      if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({ message: "Symptoms array is required" });
      }
      
      const diagnosis = await mistralHealthcareService.analyzeDifferentialDiagnosis(
        symptoms,
        patientAge,
        patientGender,
        duration,
        additionalInfo
      );
      
      res.json({
        ...diagnosis,
        generatedBy: 'mistral-7b',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Differential diagnosis error:', error);
      res.status(500).json({ message: "Failed to analyze differential diagnosis" });
    }
  });

  app.post("/api/ai/drug-interactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { medications, patientConditions, patientAge, kidneyFunction, liverFunction } = req.body;
      
      if (!medications || !Array.isArray(medications)) {
        return res.status(400).json({ message: "Medications array is required" });
      }
      
      const analysis = await mistralHealthcareService.analyzeComplexDrugInteractions(
        medications,
        patientConditions || [],
        patientAge,
        kidneyFunction,
        liverFunction
      );
      
      res.json({
        ...analysis,
        generatedBy: 'mistral-7b',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Drug interaction analysis error:', error);
      res.status(500).json({ message: "Failed to analyze drug interactions" });
    }
  });

  app.post("/api/ai/patient-education", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { diagnosis, treatmentPlan, patientAge, educationLevel = 'basic' } = req.body;
      
      if (!diagnosis) {
        return res.status(400).json({ message: "Diagnosis is required" });
      }
      
      const education = await mistralHealthcareService.generatePatientEducation(
        diagnosis,
        treatmentPlan || 'Standard care',
        patientAge,
        educationLevel
      );
      
      res.json({
        ...education,
        generatedBy: 'mistral-7b',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Patient education generation error:', error);
      res.status(500).json({ message: "Failed to generate patient education" });
    }
  });

// Debtors dashboard routes
app.get('/api/debtors/claims-batches', requireAuth, async (req, res) => {
  try {
    const batchesData = [
      {
        id: "SHA-001",
        insurer: "SHA (Social Health Authority)",
        scheme: "Universal Health Coverage",
        submissionDate: null,
        status: "pending",
        claims: [
          {
            id: "CLM-001",
            patientName: "John Wanjiku",
            services: "Consultation, Lab Tests",
            date: "2025-01-15",
            amount: 3500,
            diagnosisStatus: "missing",
            doctorName: "Dr. Sarah Mwangi",
            status: "pending"
          },
          {
            id: "CLM-002", 
            patientName: "Mary Njeri",
            services: "Surgery, Medication",
            date: "2025-01-14",
            amount: 85000,
            diagnosisStatus: "complete",
            doctorName: "Dr. Peter Kimani",
            status: "ready"
          }
        ]
      },
      {
        id: "CIC-001",
        insurer: "CIC Insurance",
        scheme: "Individual Medical Cover",
        submissionDate: null,
        status: "pending",
        claims: [
          {
            id: "CLM-003",
            patientName: "David Ochieng",
            services: "Physiotherapy",
            date: "2025-01-13",
            amount: 4500,
            diagnosisStatus: "complete",
            doctorName: "Dr. Anne Mutiso",
            status: "preauth_missing"
          }
        ]
      }
    ];
    
    res.json(batchesData);
  } catch (error) {
    console.error('Error fetching claims batches:', error);
    res.status(500).json({ error: 'Failed to fetch claims batches' });
  }
});

app.get('/api/debtors/pending-diagnosis', requireAuth, async (req, res) => {
  try {
    const pendingData = [
      {
        doctorName: "Dr. Sarah Mwangi",
        pendingCount: 3,
        email: "sarah.mwangi@knh.go.ke",
        oldestClaim: "2025-01-10",
        department: "Internal Medicine"
      },
      {
        doctorName: "Dr. James Kiprotich",
        pendingCount: 1,
        email: "james.k@aku.edu",
        oldestClaim: "2025-01-12",
        department: "Cardiology"
      }
    ];
    
    res.json(pendingData);
  } catch (error) {
    console.error('Error fetching pending diagnosis:', error);
    res.status(500).json({ error: 'Failed to fetch pending diagnosis data' });
  }
});

app.post('/api/debtors/send-reminder', requireAuth, async (req, res) => {
  try {
    const { doctorEmail, doctorName, pendingCount } = req.body;
    
    console.log(`Debtors Officer ${req.user.username} sending reminder to ${doctorName} (${doctorEmail}) for ${pendingCount} pending claims`);
    
    res.json({ 
      success: true, 
      message: `Reminder sent to ${doctorName}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

app.post('/api/debtors/submit-batch', requireAuth, async (req, res) => {
  try {
    const { batchId, verificationMethod, verificationData } = req.body;
    
    console.log(`Debtors Officer ${req.user.username} submitting batch ${batchId} with ${verificationMethod} verification`);
    
    const submissionRecord = {
      batchId,
      userId: req.user.id,
      timestamp: new Date().toISOString(),
      verificationMethod,
      status: 'submitted'
    };
    
    res.json({ 
      success: true, 
      submissionId: `SUB-${Date.now()}`,
      message: 'Batch submitted successfully',
      submissionRecord
    });
  } catch (error) {
    console.error('Error submitting batch:', error);
    res.status(500).json({ error: 'Failed to submit batch' });
  }
});

app.get('/api/debtors/verification-audit', requireAuth, async (req, res) => {
  try {
    // Check if user has premium access
    const userRole = req.user.role;
    if (userRole !== 'debtors') {
      return res.status(403).json({ error: 'Access denied. Debtors role required.' });
    }

    const { department, status, dateFrom, dateTo, search } = req.query;
    
    // Mock audit data with realistic Kenyan names and healthcare scenarios
    const auditData = [
      {
        id: "AUD-001",
        patientName: "John Wanjiku",
        service: "Consultation & Lab Tests",
        billedBy: "Dr. Sarah Mwangi",
        billedAt: "2025-01-22 10:30:00",
        verifiedBy: "John Wanjiku",
        fingerprintStatus: "verified",
        timestamp: "2025-01-22 10:28:00",
        department: "Outpatient",
        amount: 3500,
        serviceCode: "CONS-LAB-001",
        verificationHash: "fp_hash_abc123",
        timeDifference: -2
      },
      {
        id: "AUD-002",
        patientName: "Mary Njeri",
        service: "Medication Dispensing",
        billedBy: "Pharmacist Jane Kiprotich",
        billedAt: "2025-01-22 11:15:00",
        verifiedBy: "Mary Njeri",
        fingerprintStatus: "time_mismatch",
        timestamp: "2025-01-22 11:45:00",
        department: "Pharmacy",
        amount: 1200,
        serviceCode: "PHARM-DISP-002",
        verificationHash: "fp_hash_def456",
        timeDifference: 30
      },
      {
        id: "AUD-003",
        patientName: "David Ochieng",
        service: "Physiotherapy Session",
        billedBy: "Dr. Anne Mutiso",
        billedAt: "2025-01-22 09:45:00",
        verifiedBy: "",
        fingerprintStatus: "missing",
        timestamp: "",
        department: "Physiotherapy",
        amount: 2500,
        serviceCode: "PHYSIO-001",
        timeDifference: 0
      },
      {
        id: "AUD-004",
        patientName: "Grace Waweru",
        service: "Laboratory Tests",
        billedBy: "Lab Tech Samuel Kiptoo",
        billedAt: "2025-01-22 12:00:00",
        verifiedBy: "",
        fingerprintStatus: "pending",
        timestamp: "",
        department: "Laboratory",
        amount: 1800,
        serviceCode: "LAB-TESTS-003",
        timeDifference: 0
      },
      {
        id: "AUD-005",
        patientName: "Peter Kamau",
        service: "X-Ray Imaging",
        billedBy: "Radiologist Dr. Elizabeth Mutua",
        billedAt: "2025-01-22 14:20:00",
        verifiedBy: "Peter Kamau",
        fingerprintStatus: "verified",
        timestamp: "2025-01-22 14:18:00",
        department: "Radiology",
        amount: 4200,
        serviceCode: "RAD-XRAY-001",
        verificationHash: "fp_hash_ghi789",
        timeDifference: -2
      },
      {
        id: "AUD-006",
        patientName: "Agnes Wanjiru",
        service: "Dental Checkup",
        billedBy: "Dr. Michael Otieno",
        billedAt: "2025-01-22 16:00:00",
        verifiedBy: "",
        fingerprintStatus: "missing",
        timestamp: "",
        department: "Dental",
        amount: 2800,
        serviceCode: "DENT-CHECK-001",
        timeDifference: 0
      }
    ];

    // Apply filters
    let filteredData = auditData;
    
    if (department && department !== 'all') {
      filteredData = filteredData.filter(entry => entry.department === department);
    }
    
    if (status && status !== 'all') {
      filteredData = filteredData.filter(entry => entry.fingerprintStatus === status);
    }
    
    if (search) {
      const searchLower = search.toString().toLowerCase();
      filteredData = filteredData.filter(entry => 
        entry.patientName.toLowerCase().includes(searchLower) ||
        entry.service.toLowerCase().includes(searchLower) ||
        entry.billedBy.toLowerCase().includes(searchLower)
      );
    }
    
    if (dateFrom) {
      filteredData = filteredData.filter(entry => 
        new Date(entry.billedAt) >= new Date(dateFrom.toString())
      );
    }
    
    if (dateTo) {
      filteredData = filteredData.filter(entry => 
        new Date(entry.billedAt) <= new Date(dateTo.toString())
      );
    }

    res.json({
      data: filteredData,
      summary: {
        total: auditData.length,
        verified: auditData.filter(e => e.fingerprintStatus === 'verified').length,
        missing: auditData.filter(e => e.fingerprintStatus === 'missing').length,
        pending: auditData.filter(e => e.fingerprintStatus === 'pending').length,
        timeMismatches: auditData.filter(e => e.fingerprintStatus === 'time_mismatch').length
      }
    });
  } catch (error) {
    console.error('Error fetching verification audit data:', error);
    res.status(500).json({ error: 'Failed to fetch verification audit data' });
  }
});

app.get('/api/debtors/user-premium-status', requireAuth, async (req, res) => {
  try {
    // Check user's premium status - in production this would query actual user data
    const isPremium = req.user.role === 'debtors' && req.user.premiumAccess !== false;
    
    res.json({
      isPremium,
      role: req.user.role,
      features: {
        verificationAudit: isPremium,
        voidClaimsAnalysis: isPremium,
        advancedReporting: isPremium,
        bulkExport: isPremium
      }
    });
  } catch (error) {
    console.error('Error checking premium status:', error);
    res.status(500).json({ error: 'Failed to check premium status' });
  }
});

  const httpServer = createServer(app);
  return httpServer;
}
