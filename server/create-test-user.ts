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

async function createTestUser() {
  try {
    const hashedPassword = await hashPassword("test123");
    
    await db.insert(users).values({
      username: "testuser",
      email: "test@aku.edu",
      password: hashedPassword,
      name: "Test User",
      role: "doctor"
    });
    
    console.log("Test user created successfully:");
    console.log("Username: testuser");
    console.log("Email: test@aku.edu");
    console.log("Password: test123");
    
  } catch (error) {
    if (error.code === '23505') {
      console.log("Test user already exists");
    } else {
      console.error("Error creating test user:", error);
    }
  }
}

createTestUser();