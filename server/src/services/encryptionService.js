import crypto from 'crypto';

/**
 * Production-ready encryption service for securing API keys and sensitive data
 * Uses AES-256-GCM for authenticated encryption with proper key derivation
 */
export class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 12;
    this.tagLength = 16;
    this.saltLength = 32;
    
    // Use environment variable or generate a secure key
    const envKey = process.env.ENCRYPTION_KEY;
    if (envKey && envKey.length >= 32) {
      this.masterKey = Buffer.from(envKey, 'utf8').slice(0, this.keyLength);
    } else {
      // Generate a random key if not provided (for development only)
      this.masterKey = crypto.randomBytes(this.keyLength);
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_KEY environment variable must be set in production');
      }
      console.warn('Using random encryption key. Set ENCRYPTION_KEY in production.');
    }
  }

  /**
   * Derive a key from the master key using PBKDF2
   * @param {Buffer} salt - Salt for key derivation
   * @returns {Buffer} Derived key
   */
  deriveKey(salt) {
    return crypto.pbkdf2Sync(this.masterKey, salt, 100000, this.keyLength, 'sha256');
  }

  /**
   * Encrypt sensitive data with authenticated encryption
   * @param {string} plaintext - Data to encrypt
   * @returns {string} Base64 encoded encrypted data with metadata
   */
  encrypt(plaintext) {
    try {
      if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Invalid plaintext provided');
      }

      // Generate random salt and IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);
      
      // Derive encryption key
      const key = this.deriveKey(salt);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      cipher.setAAD(salt); // Use salt as additional authenticated data
      
      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Combine all components: salt + iv + tag + encrypted data
      const combined = Buffer.concat([salt, iv, tag, encrypted]);
      
      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data with authentication verification
   * @param {string} encryptedData - Base64 encoded encrypted data
   * @returns {string} Decrypted plaintext
   */
  decrypt(encryptedData) {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid encrypted data provided');
      }

      // Decode base64
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract components
      const salt = combined.slice(0, this.saltLength);
      const iv = combined.slice(this.saltLength, this.saltLength + this.ivLength);
      const tag = combined.slice(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
      const encrypted = combined.slice(this.saltLength + this.ivLength + this.tagLength);
      
      // Derive the same key
      const key = this.deriveKey(salt);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAAD(salt);
      decipher.setAuthTag(tag);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - data may be corrupted or tampered with');
    }
  }

  /**
   * Encrypt API key with additional context
   * @param {string} apiKey - API key to encrypt
   * @param {string} providerName - Provider name for context
   * @returns {string} Encrypted API key
   */
  encryptApiKey(apiKey, providerName = '') {
    if (!apiKey) return null;
    
    const contextualData = {
      apiKey,
      provider: providerName,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    return this.encrypt(JSON.stringify(contextualData));
  }

  /**
   * Decrypt API key and validate context
   * @param {string} encryptedApiKey - Encrypted API key
   * @param {string} providerName - Expected provider name
   * @returns {string} Decrypted API key
   */
  decryptApiKey(encryptedApiKey, providerName = '') {
    if (!encryptedApiKey) return null;
    
    try {
      const decryptedData = this.decrypt(encryptedApiKey);
      const contextualData = JSON.parse(decryptedData);
      
      // Validate context if provider name is specified
      if (providerName && contextualData.provider !== providerName) {
        throw new Error('Provider name mismatch');
      }
      
      // Check if the key is too old (optional security measure)
      const keyAge = Date.now() - contextualData.timestamp;
      const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
      if (keyAge > maxAge) {
        console.warn('Encrypted API key is very old, consider re-encryption');
      }
      
      return contextualData.apiKey;
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      throw new Error('Invalid or corrupted API key');
    }
  }

  /**
   * Generate a secure random token
   * @param {number} length - Token length in bytes
   * @returns {string} Hex encoded random token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash sensitive data (one-way)
   * @param {string} data - Data to hash
   * @param {string} salt - Optional salt
   * @returns {string} Hashed data
   */
  hash(data, salt = '') {
    const hash = crypto.createHash('sha256');
    hash.update(data + salt);
    return hash.digest('hex');
  }

  /**
   * Verify if the encryption service is properly configured
   * @returns {boolean} True if properly configured
   */
  isConfigured() {
    try {
      const testData = 'test-encryption-' + Date.now();
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);
      return decrypted === testData;
    } catch (error) {
      console.error('Encryption service configuration test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const encryptionService = new EncryptionService();
export default encryptionService;