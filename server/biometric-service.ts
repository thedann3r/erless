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

  // Register individual finger
  async registerIndividualFinger(
    patientId: string,
    fingerId: string,
    fingerprintData: string,
    registeredBy: string,
    deviceId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; fingerprintId?: string; error?: string }> {
    try {
      // Check if this specific finger already exists
      const existingFinger = await this.getDb()
        .collection(collections.fingerprints)
        .findOne({ patientId, fingerId, status: 'active' });

      if (existingFinger) {
        return { success: false, error: `${fingerId} fingerprint already exists for this patient` };
      }

      const fingerprintHash = this.generateFingerprintHash(fingerprintData);
      const fingerprintId = `fp_${patientId}_${fingerId}_${Date.now()}`;

      const fingerprintRecord: BiometricFingerprint = {
        fingerprintId,
        patientId,
        fingerId,
        fingerprintHash,
        fingerprintData: fingerprintData.length > 1000 ? fingerprintData.substring(0, 1000) : fingerprintData,
        deviceId,
        registeredBy,
        registeredAt: new Date(),
        status: 'active',
        metadata: {
          ipAddress,
          userAgent,
          hand: fingerId.startsWith('left') ? 'left' : 'right',
          finger: fingerId.split('_')[1] || 'unknown'
        }
      };

      await this.getDb().collection(collections.fingerprints).insertOne(fingerprintRecord as any);

      // Create audit log
      await this.createAuditLog({
        patientId,
        action: 'register_individual_finger',
        userId: registeredBy,
        userRole: 'unknown',
        deviceId,
        result: 'success',
        ipAddress,
        userAgent,
        metadata: { fingerId, fingerprintId }
      });

      return { success: true, fingerprintId };
    } catch (error) {
      console.error('Individual finger registration error:', error);
      
      // Create failed audit log
      await this.createAuditLog({
        patientId,
        action: 'register_individual_finger',
        userId: registeredBy,
        userRole: 'unknown',
        deviceId,
        result: 'failed',
        ipAddress,
        userAgent,
        metadata: { fingerId, error: error instanceof Error ? error.message : 'Unknown error' }
      });

      return { success: false, error: 'Failed to register fingerprint' };
    }
  }

  // Register new fingerprint (legacy single fingerprint)
  async registerFingerprint(
    patientId: string,
    fingerprintData: string,
    registeredBy: string,
    deviceId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; fingerprintId?: string; error?: string }> {
    try {
      // For legacy compatibility, register as right thumb
      return await this.registerIndividualFinger(
        patientId,
        'right_thumb',
        fingerprintData,
        registeredBy,
        deviceId,
        ipAddress,
        userAgent
      );
    } catch (error) {
      console.error('Legacy fingerprint registration error:', error);
      return { success: false, error: 'Failed to register fingerprint' };
    }
  }

  // Get all registered fingers for a patient
  async getPatientFingerprints(patientId: string): Promise<Array<{
    fingerId: string;
    fingerprintId: string;
    registeredAt: Date;
    status: string;
    hand: string;
    finger: string;
  }>> {
    try {
      const fingerprints = await this.getDb()
        .collection(collections.fingerprints)
        .find({ patientId, status: 'active' })
        .sort({ registeredAt: -1 })
        .toArray();

      return fingerprints.map((fp: any) => ({
        fingerId: fp.fingerId,
        fingerprintId: fp.fingerprintId,
        registeredAt: fp.registeredAt,
        status: fp.status,
        hand: fp.metadata?.hand || 'unknown',
        finger: fp.metadata?.finger || 'unknown'
      }));
    } catch (error) {
      console.error('Error getting patient fingerprints:', error);
      return [];
    }
  }

  // Check how many fingers are registered for patient
  async getRegistrationCount(patientId: string): Promise<{
    total: number;
    leftHand: number;
    rightHand: number;
    fingers: string[];
  }> {
    try {
      const fingerprints = await this.getPatientFingerprints(patientId);
      
      const leftHand = fingerprints.filter(fp => fp.hand === 'left').length;
      const rightHand = fingerprints.filter(fp => fp.hand === 'right').length;
      const fingers = fingerprints.map(fp => fp.fingerId);

      return {
        total: fingerprints.length,
        leftHand,
        rightHand,
        fingers
      };
    } catch (error) {
      console.error('Error getting registration count:', error);
      return { total: 0, leftHand: 0, rightHand: 0, fingers: [] };
    }
  }

  // Enhanced verification with multiple fingerprint support
  async verifyMultipleFingerprints(
    patientId: string,
    fingerprintData: string,
    userId: string,
    userRole: string,
    deviceId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; verificationScore?: number; matchedFinger?: string; error?: string }> {
    try {
      const fingerprintHash = this.generateFingerprintHash(fingerprintData);
      
      // Get all active fingerprints for patient
      const fingerprints = await this.getDb()
        .collection(collections.fingerprints)
        .find({ patientId, status: 'active' })
        .toArray();

      if (fingerprints.length === 0) {
        return { success: false, error: 'No fingerprints registered for this patient' };
      }

      // Check against all registered fingerprints
      let bestMatch = { score: 0, fingerId: '' };
      
      for (const fp of fingerprints) {
        const similarity = this.calculateSimilarity(fingerprintHash, fp.fingerprintHash);
        if (similarity > bestMatch.score) {
          bestMatch = { score: similarity, fingerId: fp.fingerId };
        }
      }

      const threshold = 85; // 85% similarity threshold
      const success = bestMatch.score >= threshold;

      // Create audit log
      await this.createAuditLog({
        patientId,
        action: 'verify_multiple_fingerprints',
        userId,
        userRole,
        deviceId,
        result: success ? 'success' : 'failed',
        ipAddress,
        userAgent,
        metadata: { 
          verificationScore: bestMatch.score,
          matchedFinger: success ? bestMatch.fingerId : null,
          threshold
        }
      });

      if (success) {
        return { 
          success: true, 
          verificationScore: bestMatch.score,
          matchedFinger: bestMatch.fingerId
        };
      } else {
        return { 
          success: false, 
          error: `Verification failed. Best match: ${Math.round(bestMatch.score)}% (required: ${threshold}%)`,
          verificationScore: bestMatch.score
        };
      }
    } catch (error) {
      console.error('Multi-fingerprint verification error:', error);
      
      // Create failed audit log
      await this.createAuditLog({
        patientId,
        action: 'verify_multiple_fingerprints',
        userId,
        userRole,
        deviceId,
        result: 'failed',
        ipAddress,
        userAgent,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      return { success: false, error: 'Verification service unavailable' };
    }
  }

  // Original single fingerprint verification (for backward compatibility)
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
      const result = await this.verifyMultipleFingerprints(
        patientId,
        fingerprintData,
        userId,
        userRole,
        deviceId,
        ipAddress,
        userAgent
      );

      return {
        success: result.success,
        verificationScore: result.verificationScore,
        error: result.error
      };
    } catch (error) {
      console.error('Legacy fingerprint verification error:', error);
      return { success: false, error: 'Verification service unavailable' };
    }
  }

  // Enhanced fingerprint info
  async getEnhancedFingerprintInfo(patientId: string): Promise<{
    registered: boolean;
    count: number;
    leftHand: number;
    rightHand: number;
    fingers: Array<{
      fingerId: string;
      hand: string;
      finger: string;
      registeredAt: Date;
    }>;
  } | null> {
    try {
      const fingerprints = await this.getPatientFingerprints(patientId);
      
      if (fingerprints.length === 0) {
        return {
          registered: false,
          count: 0,
          leftHand: 0,
          rightHand: 0,
          fingers: []
        };
      }

      const leftHand = fingerprints.filter(fp => fp.hand === 'left').length;
      const rightHand = fingerprints.filter(fp => fp.hand === 'right').length;

      return {
        registered: true,
        count: fingerprints.length,
        leftHand,
        rightHand,
        fingers: fingerprints.map(fp => ({
          fingerId: fp.fingerId,
          hand: fp.hand,
          finger: fp.finger,
          registeredAt: fp.registeredAt
        }))
      };
    } catch (error) {
      console.error('Error getting enhanced fingerprint info:', error);
      return null;
    }
  }

  // Legacy fingerprint info (for backward compatibility)
  async getFingerprintInfo(patientId: string): Promise<any> {
    try {
      const enhancedInfo = await this.getEnhancedFingerprintInfo(patientId);
      
      if (!enhancedInfo || !enhancedInfo.registered) {
        return null;
      }

      // Return legacy format for backward compatibility
      const firstFingerprint = enhancedInfo.fingers[0];
      
      return {
        patientId,
        fingerprintHash: 'hash_hidden_for_security',
        registeredBy: 'system',
        registeredAt: firstFingerprint.registeredAt.toISOString(),
        status: 'active'
      };
    } catch (error) {
      console.error('Error getting legacy fingerprint info:', error);
      return null;
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