import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Derives a 256-bit key from BETTER_AUTH_SECRET.
 * Uses SHA-256 so any secret length works.
 */
function getKey(): Buffer {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required for encryption");
  return createHash("sha256").update(secret).digest();
}

/**
 * Encrypts plaintext with AES-256-GCM.
 * Returns: base64(iv + ciphertext + authTag)
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Pack: iv (12) + ciphertext (N) + tag (16)
  const packed = Buffer.concat([iv, encrypted, tag]);
  return packed.toString("base64");
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 */
export function decrypt(encoded: string): string {
  const key = getKey();
  const packed = Buffer.from(encoded, "base64");

  const iv = packed.subarray(0, IV_LENGTH);
  const tag = packed.subarray(packed.length - TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH, packed.length - TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/**
 * Checks if a string looks like an encrypted payload (base64 with minimum size).
 * Used to handle legacy unencrypted data gracefully during migration.
 */
export function isEncrypted(value: string): boolean {
  // Encrypted data is base64 and at least iv(12) + tag(16) = 28 bytes → ~40 base64 chars
  if (value.length < 40) return false;
  // Quick heuristic: valid base64 and doesn't start with [ or { (JSON)
  const firstChar = value.charAt(0);
  if (firstChar === "[" || firstChar === "{") return false;
  return /^[A-Za-z0-9+/]+=*$/.test(value);
}

/**
 * Safely decrypts — returns the raw string if it's not encrypted (legacy data).
 */
export function safeDecrypt(value: string): string {
  if (!isEncrypted(value)) return value;
  try {
    return decrypt(value);
  } catch {
    // If decryption fails, return raw (legacy unencrypted data)
    return value;
  }
}
