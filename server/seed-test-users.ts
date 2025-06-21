import { db } from "./db";
import { users, patients, careProviders } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedTestUsers() {
  try {
    console.log("Creating test care provider...");
    
    // Create test care provider
    const [testProvider] = await db
      .insert(careProviders)
      .values({
        name: "Test Medical Center",
        domain: "test.med",
        type: "hospital",
        branch: "Main Campus",
        address: "123 Medical Street, Nairobi",
        licenseNumber: "MCL-2024-001",
        contactEmail: "admin@test.med",
        contactPhone: "+254712345678",
        contactPerson: "Dr. Test Administrator",
        schemesSupported: ["CIC", "AAR", "SHA"],
        onboardingStatus: "approved",
        isActive: true
      })
      .onConflictDoNothing()
      .returning();

    console.log("Creating test users...");

    // Hash the common test password
    const testPasswordHash = await hashPassword("test123");

    // Test users for different roles
    const testUsers = [
      {
        username: "testuser",
        email: "test@test.med",
        password: testPasswordHash,
        name: "Test User",
        role: "admin",
        department: "Administration",
        careProviderId: testProvider?.id,
        isVerified: true
      },
      {
        username: "doctor1",
        email: "doctor@test.med", 
        password: testPasswordHash,
        name: "Dr. Sarah Mwangi",
        role: "doctor",
        department: "Internal Medicine",
        careProviderId: testProvider?.id,
        registrationNumber: "DOC-12345",
        registrationBody: "KMPDC",
        isVerified: true
      },
      {
        username: "pharmacist1",
        email: "pharmacist@test.med",
        password: testPasswordHash,
        name: "John Kimani",
        role: "pharmacy",
        department: "Pharmacy",
        careProviderId: testProvider?.id,
        registrationNumber: "PHARM-67890",
        registrationBody: "PPB",
        isVerified: true
      },
      {
        username: "frontoffice1",
        email: "frontoffice@test.med",
        password: testPasswordHash,
        name: "Grace Wanjiku",
        role: "front-office",
        department: "Patient Services",
        careProviderId: testProvider?.id,
        isVerified: true
      },
      {
        username: "caremanager1",
        email: "caremanager@test.med",
        password: testPasswordHash,
        name: "Peter Ochieng",
        role: "care-manager",
        department: "Care Management",
        careProviderId: testProvider?.id,
        isVerified: true
      },
      {
        username: "insurer1",
        email: "insurer@cic.co.ke",
        password: testPasswordHash,
        name: "Mary Njeri",
        role: "insurer",
        department: "Claims Processing",
        isVerified: true
      }
    ];

    for (const user of testUsers) {
      await db
        .insert(users)
        .values(user)
        .onConflictDoNothing();
    }

    console.log("Creating test patients...");

    // Create some test patients
    const testPatients = [
      {
        patientId: "PT-2024-001",
        firstName: "Sarah",
        lastName: "Johnson",
        dateOfBirth: new Date("1985-06-15"),
        gender: "Female",
        phoneNumber: "+254712345678",
        email: "sarah.j@email.com",
        address: "123 Valley Road, Nairobi",
        insuranceProvider: "SHA",
        insurancePlan: "Essential Package",
        policyNumber: "SHA-001234567",
        memberSince: new Date("2020-01-01"),
        biometricHash: "mock_fingerprint_hash_001",
        isActive: true
      },
      {
        patientId: "PT-2024-002",
        firstName: "Michael",
        lastName: "Ochieng",
        dateOfBirth: new Date("1978-03-22"),
        gender: "Male",
        phoneNumber: "+254723456789",
        email: "michael.o@email.com",
        address: "456 Uhuru Highway, Nairobi",
        insuranceProvider: "CIC",
        insurancePlan: "Comprehensive Cover",
        policyNumber: "CIC-987654321",
        memberSince: new Date("2019-06-15"),
        biometricHash: "mock_fingerprint_hash_002",
        isActive: true
      },
      {
        patientId: "PT-2024-003",
        firstName: "Grace",
        lastName: "Wanjiku",
        dateOfBirth: new Date("1992-11-08"),
        gender: "Female",
        phoneNumber: "+254734567890",
        email: "grace.w@email.com",
        address: "789 Moi Avenue, Nairobi",
        insuranceProvider: "AAR",
        insurancePlan: "Family Cover",
        policyNumber: "AAR-555666777",
        memberSince: new Date("2021-03-10"),
        biometricHash: "mock_fingerprint_hash_003",
        isActive: true
      }
    ];

    for (const patient of testPatients) {
      await db
        .insert(patients)
        .values(patient)
        .onConflictDoNothing();
    }

    console.log("Test data seeded successfully!");
    
    console.log("\n=== TEST USER CREDENTIALS ===");
    console.log("Username: testuser (Admin)");
    console.log("Email: test@test.med");
    console.log("Password: test123");
    console.log("");
    console.log("Username: doctor1 (Doctor)");
    console.log("Email: doctor@test.med");
    console.log("Password: test123");
    console.log("");
    console.log("Username: pharmacist1 (Pharmacist)");
    console.log("Email: pharmacist@test.med");
    console.log("Password: test123");
    console.log("");
    console.log("Username: frontoffice1 (Front Office)");
    console.log("Email: frontoffice@test.med");
    console.log("Password: test123");
    console.log("==============================\n");

  } catch (error) {
    console.error("Error seeding test data:", error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTestUsers()
    .then(() => {
      console.log("Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}