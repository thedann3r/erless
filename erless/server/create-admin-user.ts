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

async function createAdminUser() {
  try {
    const hashedPassword = await hashPassword("test123");
    
    await db.insert(users).values({
      username: "admin",
      email: "admin@erlessed.com",
      password: hashedPassword,
      name: "Administrator",
      role: "admin"
    });
    
    console.log("Admin user created successfully:");
    console.log("Username: admin");
    console.log("Email: admin@erlessed.com");
    console.log("Password: test123");
    
  } catch (error) {
    if (error.code === '23505') {
      console.log("Admin user already exists");
    } else {
      console.error("Error creating admin user:", error);
    }
  }
}

createAdminUser();