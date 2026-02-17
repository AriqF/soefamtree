/**
 * Secure Storage Utility
 * 
 * Provides encrypted storage for sensitive data in the browser.
 * Uses base64 encoding with obfuscation (not true encryption, but better than plain text).
 * 
 * For production, consider using:
 * - HttpOnly cookies for tokens (most secure)
 * - IndexedDB with Web Crypto API for true encryption
 * - Session storage for temporary data
 */

const STORAGE_KEY_PREFIX = '__soefam_secure_';
const OBFUSCATION_KEY = 'SoeFamTree2024Secret'; // Change this to a random string

/**
 * Simple obfuscation (XOR cipher)
 * Note: This is NOT true encryption, just obfuscation to prevent casual tampering
 */
function obfuscate(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)
    );
  }
  return btoa(result); // Base64 encode
}

function deobfuscate(encoded: string): string {
  try {
    const text = atob(encoded); // Base64 decode
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)
      );
    }
    return result;
  } catch {
    return '';
  }
}

/**
 * Secure Storage Interface
 */
export const SecureStorage = {
  /**
   * Set a value in secure storage
   */
  set: (key: string, value: string | object): void => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const obfuscated = obfuscate(stringValue);
      localStorage.setItem(STORAGE_KEY_PREFIX + key, obfuscated);
    } catch (error) {
      console.error('Failed to save to secure storage:', error);
    }
  },

  /**
   * Get a value from secure storage
   */
  get: <T = string>(key: string): T | null => {
    try {
      const obfuscated = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      if (!obfuscated) return null;
      
      const deobfuscated = deobfuscate(obfuscated);
      if (!deobfuscated) return null;

      // Try to parse as JSON, if fails return as string
      try {
        return JSON.parse(deobfuscated) as T;
      } catch {
        return deobfuscated as T;
      }
    } catch (error) {
      console.error('Failed to read from secure storage:', error);
      return null;
    }
  },

  /**
   * Remove a value from secure storage
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + key);
    } catch (error) {
      console.error('Failed to remove from secure storage:', error);
    }
  },

  /**
   * Clear all secure storage
   */
  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
    }
  },

  /**
   * Check if a key exists
   */
  has: (key: string): boolean => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + key) !== null;
  },
};

/**
 * Auth Storage - Specific methods for authentication data
 */
export const AuthStorage = {
  /**
   * Save authentication session
   */
  setSession: (data: {
    token: string;
    refreshToken?: string;
    expiresIn?: number;
    isAdmin: boolean;
    adminIndex?: number;
    user?: any;
  }): void => {
    const sessionData = {
      ...data,
      timestamp: Date.now(),
      expiresAt: data.expiresIn ? Date.now() + data.expiresIn * 1000 : null,
    };
    SecureStorage.set('auth_session', sessionData);
  },

  /**
   * Get authentication session
   */
  getSession: (): {
    token: string;
    refreshToken?: string;
    isAdmin: boolean;
    adminIndex?: number;
    user?: any;
    timestamp: number;
    expiresAt: number | null;
  } | null => {
    return SecureStorage.get('auth_session');
  },

  /**
   * Check if session is valid (not expired)
   */
  isSessionValid: (): boolean => {
    const session = AuthStorage.getSession();
    if (!session) return false;
    
    // Check if token exists
    if (!session.token) return false;
    
    // Check if expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      AuthStorage.clearSession();
      return false;
    }
    
    return true;
  },

  /**
   * Get auth token
   */
  getToken: (): string | null => {
    const session = AuthStorage.getSession();
    return session?.token || null;
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    const session = AuthStorage.getSession();
    return session?.refreshToken || null;
  },

  /**
   * Check if user is admin
   */
  isAdmin: (): boolean => {
    const session = AuthStorage.getSession();
    return session?.isAdmin || false;
  },

  /**
   * Get admin index
   */
  getAdminIndex: (): number | null => {
    const session = AuthStorage.getSession();
    return session?.adminIndex ?? null;
  },

  /**
   * Get user data
   */
  getUser: (): any | null => {
    const session = AuthStorage.getSession();
    return session?.user || null;
  },

  /**
   * Clear authentication session
   */
  clearSession: (): void => {
    SecureStorage.remove('auth_session');
  },
};

/**
 * Token validation helpers
 */
export const TokenUtils = {
  /**
   * Decode JWT token (without verification - for reading claims only)
   */
  decodeToken: (token: string): any | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = atob(parts[1]);
      return JSON.parse(payload);
    } catch {
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = TokenUtils.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  },

  /**
   * Get token expiration time
   */
  getTokenExpiration: (token: string): Date | null => {
    try {
      const decoded = TokenUtils.decodeToken(token);
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  },
};
