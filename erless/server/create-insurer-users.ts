import { db } from './db';
import { users } from '@shared/schema';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

const createInsurerUsers = async () => {
  const hashedPassword = await hashPassword('test123');

  try {
    // Claims Manager
    await db.insert(users).values({
      username: 'claims_manager1',
      password: hashedPassword,
      email: 'claims.manager@cic.co.ke',
      role: 'claims_manager',
      firstName: 'Joseph',
      lastName: 'Kamau',
      department: 'Claims Processing',
      insurerRole: 'claims_manager',
      insurerCompany: 'CIC',
      isActive: true,
    });

    // Care Manager
    await db.insert(users).values({
      username: 'care_manager1',
      password: hashedPassword,
      email: 'care.manager@aar.co.ke',
      role: 'care_manager',
      firstName: 'Grace',
      lastName: 'Wanjiku',
      department: 'Care Management',
      insurerRole: 'care_manager',
      insurerCompany: 'AAR',
      isActive: true,
    });

    // Insurer Admin
    await db.insert(users).values({
      username: 'insurer_admin1',
      password: hashedPassword,
      email: 'admin@sha.gov.ke',
      role: 'insurer_admin',
      firstName: 'Samuel',
      lastName: 'Mwangi',
      department: 'Administration',
      insurerRole: 'insurer_admin',
      insurerCompany: 'SHA',
      isActive: true,
    });

    console.log('✅ Insurer test users created successfully!');
    console.log('Test credentials:');
    console.log('Claims Manager: claims_manager1 / test123');
    console.log('Care Manager: care_manager1 / test123');
    console.log('Insurer Admin: insurer_admin1 / test123');
  } catch (error) {
    console.error('Error creating insurer users:', error);
  }
};

createInsurerUsers();