import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'erlessed_biometric';

export async function connectMongoDB(): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log("⏩ Skipping MongoDB connection in development mode");
    return;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    console.log('✅ Connected to MongoDB for biometric data');
  } catch (error) {
    console.error('❌ MongoDB connection failed - biometric features will be unavailable:', error);
    // Don't throw error to allow server to start without MongoDB
  }
}


export function getMongoDb(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  }
  return db;
}

export function isMongoConnected(): boolean {
  return !!db;
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
}

// Collections
export const collections = {
  fingerprints: 'fingerprints',
  biometricAuditLogs: 'biometric_audit_logs',
  biometricSessions: 'biometric_sessions'
};

// Types
export interface BiometricFingerprint {
  _id?: string;
  fingerprintId: string;
  patientId: string;
  fingerId: string; // e.g., 'right_thumb', 'left_index'
  fingerprintHash: string;
  fingerprintData: string; // Base64 encoded fingerprint image/data
  deviceId: string;
  registeredBy: string; // user ID who registered
  registeredAt: Date;
  status: 'active' | 'archived' | 'pending_reset';
  metadata?: {
    ipAddress: string;
    userAgent: string;
    hand: 'left' | 'right';
    finger: string; // thumb, index, middle, ring, pinky
  };
  resetRequests?: BiometricResetRequest[];
}

export interface BiometricResetRequest {
  requestedBy: string;
  requestedAt: Date;
  reason: string;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface BiometricAuditLog {
  _id?: string;
  patientId: string;
  action: 'register' | 'verify' | 'reset_request' | 'reset_approved' | 'reset_rejected' | 'verification_failed';
  userId: string;
  userRole: string;
  deviceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: {
    success?: boolean;
    errorMessage?: string;
    fingerprintHash?: string;
    verificationScore?: number;
    [key: string]: any;
  };
}

export interface BiometricSession {
  _id?: string;
  sessionId: string;
  patientId: string;
  userId: string;
  action: 'verify' | 'register';
  status: 'pending' | 'completed' | 'failed' | 'expired';
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  metadata: {
    deviceId?: string;
    ipAddress: string;
    userAgent: string;
    [key: string]: any;
  };
}