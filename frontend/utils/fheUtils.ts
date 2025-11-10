/**
 * Utility functions for FHE data formatting and validation
 */

/**
 * Formats an encrypted value for display
 * @param value - The encrypted value or decrypted clear value
 * @returns Formatted string representation
 */
export function formatFHEValue(value: any): string {
  if (value === null || value === undefined) {
    return "Not available";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  return "Encrypted";
}

/**
 * Validates if a score is within the acceptable range for trust scores
 * @param score - The score to validate
 * @returns True if score is between 1-10 inclusive
 */
export function isValidTrustScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 10;
}

/**
 * Formats a timestamp for display
 * @param timestamp - Unix timestamp
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}

/**
 * Calculates percentage from encrypted total and count
 * @param total - Encrypted total value
 * @param count - Plaintext count
 * @returns Percentage string or null if calculation not possible
 */
export function calculatePercentage(total: any, count: number): string | null {
  if (!total || !count || count === 0) {
    return null;
  }

  // In a real FHE implementation, this would be calculated on encrypted data
  return "Calculation requires decryption";
}
