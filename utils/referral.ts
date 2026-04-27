const SALT = 42; // Secret salt to prevent simple sum guessing

/**
 * Generates a consistent 6-digit numeric code from a string ID with a salted checksum.
 * 5 digits of hash + 1 digit salted checksum.
 */
export const generateNumericCode = (id: string | null): string => {
  if (!id) return "000000";
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  
  const absHash = Math.abs(hash).toString();
  // We use digits from the middle of the hash for more randomness
  const base = absHash.length > 5 ? absHash.slice(1, 6) : absHash.padStart(5, "0");
  
  // Salted Checksum: (Sum * SALT) % 10
  const sum = base.split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const checksum = (sum + SALT) % 10;
  
  return `${base}${checksum}`;
};

/**
 * Verifies if a 6-digit code matches our internal salted checksum logic.
 */
export const verifyReferralCode = (code: string): boolean => {
  const trimmed = code.trim();
  if (!/^[0-9]{6}$/.test(trimmed)) return false;
  
  const base = trimmed.slice(0, 5);
  const providedChecksum = parseInt(trimmed.charAt(5), 10);
  const sum = base.split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const calculatedChecksum = (sum + SALT) % 10;
  
  return providedChecksum === calculatedChecksum;
};
