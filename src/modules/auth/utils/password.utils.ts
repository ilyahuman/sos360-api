/**
 * Password Utilities
 *
 * Provides password hashing, verification, and validation using Argon2.
 * Argon2 is the winner of the Password Hashing Competition and is recommended
 * over bcrypt for new applications due to better resistance to GPU attacks.
 */

import { hash, verify } from '@node-rs/argon2';

export class PasswordUtils {
  /**
   * Hash a plain-text password using Argon2id.
   * Argon2id is the recommended variant that provides resistance to both
   * side-channel and GPU attacks.
   *
   * Default parameters are suitable for most applications:
   * - memoryCost: 19456 KiB (19 MiB)
   * - timeCost: 2 iterations
   * - parallelism: 1 thread
   */
  static async hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, {
      memoryCost: 19456, // 19 MiB
      timeCost: 2,
      parallelism: 1,
    });
  }

  /**
   * Compare a plain-text password with an Argon2 hashed password.
   *
   * @param plainPassword - The plain-text password to verify
   * @param hashedPassword - The Argon2 hash to verify against
   * @returns True if the password matches, false otherwise
   */
  static async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return verify(hashedPassword, plainPassword);
    } catch (error) {
      // If verification fails (e.g., invalid hash format), return false
      return false;
    }
  }

  /**
   * Validate password complexity according to MVP requirements.
   *
   * Rules:
   * - Minimum 8 characters
   * - At least 1 uppercase letter (A-Z)
   * - At least 1 lowercase letter (a-z)
   * - At least 1 number (0-9)
   * - At least 1 special character (@$!%*?&#)
   *
   * @param password - The password to validate
   * @returns Object with validation result and error messages
   */
  static validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&#]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&#)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
