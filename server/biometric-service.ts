import { getMongoDb, isMongoConnected, collections, BiometricFingerprint, BiometricAuditLog, BiometricSession, BiometricResetRequest } from './mongodb';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'erlessed-jwt-secret-key-2025';

export class BiometricService {
  private getDb() {
    if (!isMongoConnected()) {
      throw new Error('Biometric service unavailable - MongoDB not connected');
    }
    return getMongoDb();
  }

  // Generate fingerprint hash from raw data
  private generateFingerprintHash(fingerprintData: string): string {
    return crypto.createHash('sha256').update(fingerprintData).digest('hex');
  }

  // Create audit log entry
  private async createAuditLog(log: Omit<BiometricAuditLog, '_id' | 'timestamp'>): Promise<void> {
    const auditLog: BiometricAuditLog = {
      ...log,
      timestamp: new Date()
    };
    
    await this.getDb().collection(collections.biometricAuditLogs).insertOne(auditLog);
  }

  // Generate JWT for authenticated actions
  public generateBiometricToken(userId: string, role: string, action: string): string {
    return jwt.sign(
      { userId, role, action, type: 'biometric' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  // Verify JWT token
  public verifyBiometricToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Check if fingerprint exists for patient
  async checkFingerprintExists(patientId: string): Promise<boolean> {
    const fingerprint = await this.getDb()
      .collection(collections.fingerprints)
      .findOne({ patientId, status: 'active' });
    
    return !!fingerprint;
  }

  // Register new fingerprint
  async registerFingerprint(
    patientId: string,
    fingerprintData: string,
    registeredBy: string,
    deviceId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; fingerprintId?: string; error?: string }> {
    try {
      // Check if fingerprint already exists
      const existingFingerprint = await this.getDb()
        .collection(collections.fingerprints)
        .findOne({ patientId, status: 'active' });

      if (existingFingerprint) {
        return { success: false, error: 'Fingerprint already exists for this patient' };
      }

      // Create fingerprint hash
      const fingerprintHash = this.generateFingerprintHash(fingerprintData);

      // Check for duplicate fingerprint hash (prevent same fingerprint for different patients)
      const duplicateHash = await this.getDb()
        .collection(collections.fingerprints)
        .findOne({ fingerprintHash, status: 'active' });

      if (duplicateHash) {
        await this.createAuditLog({
          patientId,
          action: 'register',
          userId: registeredBy,
          userRole: 'unknown',
          deviceId,
          ipAddress,
          userAgent,
          details: { success: false, errorMessage: 'Duplicate fingerprint detected' }
        });
        return { success: false, error: 'This fingerprint is already registered to another patient' };
      }

      // Register new fingerprint
      const newFingerprint: BiometricFingerprint = {
        patientId,
        fingerprintHash,
        fingerprintData,
        deviceId,
        registeredBy,
        registeredAt: new Date(),
        status: 'active'
      };

      const result = await this.getDb()
        .collection(collections.fingerprints)
        .insertOne(newFingerprint);

      // Log successful registration
      await this.createAuditLog({
        patientId,
        action: 'register',
        userId: registeredBy,
        userRole: 'unknown',
        deviceId,
        ipAddress,
        userAgent,
        details: { success: true, fingerprintHash }
      });

      return { success: true, fingerprintId: result.insertedId.toString() };
    } catch (error) {
      console.error('Fingerprint registration error:', error);
      
      await this.createAuditLog({
        patientId,
        action: 'register',
        userId: registeredBy,
        userRole: 'unknown',
        deviceId: deviceId || 'unknown',
        ipAddress,
        userAgent,
        details: { success: false, errorMessage: error instanceof Error ? error.message : 'Unknown error' }
      });

      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  // Verify fingerprint
  async verifyFingerprint(
    patientId: string,
    fingerprintData: string,
    userId: string,
    userRole: string,
    deviceId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; verificationScore?: number; error?: string }> {
    try {
      // Get active fingerprint for patient
      const storedFingerprint = await this.getDb()
        .collection(collections.fingerprints)
        .findOne({ patientId, status: 'active' });

      if (!storedFingerprint) {
        await this.createAuditLog({
          patientId,
          action: 'verification_failed',
          userId,
          userRole,
          deviceId,
          ipAddress,
          userAgent,
          details: { success: false, errorMessage: 'No fingerprint found for patient' }
        });
        return { success: false, error: 'No fingerprint registered for this patient' };
      }

      // Generate hash of provided fingerprint
      const providedHash = this.generateFingerprintHash(fingerprintData);
      
      // Calculate verification score (in real system, this would use biometric matching algorithms)
      const verificationScore = this.calculateBiometricScore(storedFingerprint.fingerprintHash, providedHash);
      
      const isMatch = verificationScore >= 85; // 85% threshold for successful verification

      // Log verification attempt
      await this.createAuditLog({
        patientId,
        action: 'verify',
        userId,
        userRole,
        deviceId,
        ipAddress,
        userAgent,
        details: { 
          success: isMatch, 
          verificationScore,
          errorMessage: isMatch ? undefined : 'Fingerprint mismatch'
        }
      });

      if (isMatch) {
        return { success: true, verificationScore };
      } else {
        return { success: false, verificationScore, error: 'Fingerprint verification failed' };
      }
    } catch (error) {
      console.error('Fingerprint verification error:', error);
      
      await this.createAuditLog({
        patientId,
        action: 'verification_failed',
        userId,
        userRole,
        deviceId: deviceId || 'unknown',
        ipAddress,
        userAgent,
        details: { success: false, errorMessage: error instanceof Error ? error.message : 'Unknown error' }
      });

      return { success: false, error: 'Verification failed. Please try again.' };
    }
  }

  // Calculate biometric matching score (simplified simulation)
  private calculateBiometricScore(storedHash: string, providedHash: string): number {
    if (storedHash === providedHash) {
      return 100; // Perfect match
    }

    // Simulate partial matching based on hash similarity
    let matchingChars = 0;
    const minLength = Math.min(storedHash.length, providedHash.length);
    
    for (let i = 0; i < minLength; i++) {
      if (storedHash[i] === providedHash[i]) {
        matchingChars++;
      }
    }

    // Add some randomness to simulate real biometric matching variability
    const baseScore = (matchingChars / minLength) * 100;
    const randomVariation = (Math.random() - 0.5) * 20; // ±10% variation
    
    return Math.max(0, Math.min(100, baseScore + randomVariation));
  }

  // Request fingerprint reset (care managers and insurers)
  async requestFingerprintReset(
    patientId: string,
    requestedBy: string,
    reason: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; resetRequestId?: string; error?: string }> {
    try {
      const fingerprint = await this.getDb()
        .collection(collections.fingerprints)
        .findOne({ patientId, status: 'active' });

      if (!fingerprint) {
        return { success: false, error: 'No active fingerprint found for this patient' };
      }

      const resetRequest: BiometricResetRequest = {
        requestedBy,
        requestedAt: new Date(),
        reason,
        status: 'pending'
      };

      // Add reset request to fingerprint document
      await this.getDb()
        .collection(collections.fingerprints)
        .updateOne(
          { patientId, status: 'active' },
          { $push: { resetRequests: resetRequest } }
        );

      // Log reset request
      await this.createAuditLog({
        patientId,
        action: 'reset_request',
        userId: requestedBy,
        userRole: 'care_manager',
        ipAddress,
        userAgent,
        details: { success: true, reason }
      });

      return { success: true, resetRequestId: crypto.randomUUID() };
    } catch (error) {
      console.error('Reset request error:', error);
      return { success: false, error: 'Failed to create reset request' };
    }
  }

  // Reset fingerprint (archives old, sets status to pending_reset)
  async resetFingerprint(
    patientId: string,
    resetBy: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Archive current fingerprint
      await this.getDb()
        .collection(collections.fingerprints)
        .updateOne(
          { patientId, status: 'active' },
          { $set: { status: 'archived', archivedAt: new Date(), archivedBy: resetBy } }
        );

      // Log reset action
      await this.createAuditLog({
        patientId,
        action: 'reset_approved',
        userId: resetBy,
        userRole: 'care_manager',
        ipAddress,
        userAgent,
        details: { success: true }
      });

      return { success: true };
    } catch (error) {
      console.error('Reset fingerprint error:', error);
      return { success: false, error: 'Failed to reset fingerprint' };
    }
  }

  // Get audit logs for patient
  async getAuditLogs(patientId: string, limit: number = 50): Promise<BiometricAuditLog[]> {
    const logs = await this.getDb()
      .collection(collections.biometricAuditLogs)
      .find({ patientId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return logs;
  }

  // Get fingerprint info for patient
  async getFingerprintInfo(patientId: string): Promise<BiometricFingerprint | null> {
    const fingerprint = await this.getDb()
      .collection(collections.fingerprints)
      .findOne({ patientId, status: 'active' });

    if (fingerprint) {
      // Remove sensitive fingerprint data from response
      const { fingerprintData, ...safeFingerprint } = fingerprint;
      return safeFingerprint as BiometricFingerprint;
    }

    return null;
  }
}

export const biometricService = new BiometricService();