import { db } from "./db";
import { users } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function createSimpleUsers() {
  try {
    console.log("Creating test users...");

    const testPasswordHash = await hashPassword("test123");

    const testUsers = [
      {
        username: "testuser",
        email: "test@test.med",
        password: testPasswordHash,
        name: "Test User",
        role: "admin"
      },
      {
        username: "doctor1",
        email: "doctor@test.med", 
        password: testPasswordHash,
        name: "Dr. Sarah Mwangi",
        role: "doctor"
      },
      {
        username: "pharmacist1",
        email: "pharmacist@test.med",
        password: testPasswordHash,
        name: "John Kimani",
        role: "pharmacy"
      },
      {
        username: "frontoffice1",
        email: "frontoffice@test.med",
        password: testPasswordHash,
        name: "Grace Wanjiku",
        role: "front-office"
      },
      {
        username: "caremanager1",
        email: "caremanager@test.med",
        password: testPasswordHash,
        name: "Peter Ochieng",
        role: "care-manager"
      },
      {
        username: "insurer1",
        email: "insurer@cic.co.ke",
        password: testPasswordHash,
        name: "Mary Njeri",
        role: "insurer"
      }
    ];

    for (const user of testUsers) {
      try {
        await db
          .insert(users)
          .values(user)
          .onConflictDoNothing();
        console.log(`Created user: ${user.username}`);
      } catch (error) {
        console.log(`User ${user.username} already exists or error:`, error.message);
      }
    }

    console.log("\n=== TEST USER CREDENTIALS ===");
    console.log("Username: testuser (Admin) | Password: test123");
    console.log("Username: doctor1 (Doctor) | Password: test123");
    console.log("Username: pharmacist1 (Pharmacist) | Password: test123");
    console.log("Username: frontoffice1 (Front Office) | Password: test123");
    console.log("Username: caremanager1 (Care Manager) | Password: test123");
    console.log("Username: insurer1 (Insurer) | Password: test123");
    console.log("==============================\n");

  } catch (error) {
    console.error("Error creating users:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createSimpleUsers()
    .then(() => {
      console.log("User creation completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("User creation failed:", error);
      process.exit(1);
    });
}