const SALT = 42; // Secret salt to prevent simple sum guessing

/**
 * Generates a consistent 5-digit numeric code from a string ID with a salted checksum.
 * 4 digits of hash + 1 digit salted checksum.
 */
export const generateNumericCode = (id: string | null): string => {
  if (!id) return "";

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }

  const absHash = Math.abs(hash).toString().padStart(4, "0");
  const base = absHash.slice(0, 4);

  // Salted Checksum: (Sum * SALT) % 10
  const sum = base.split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const checksum = (sum + SALT) % 10;

  return `${base}${checksum}`;
};

/**
 * Verifies if a 5-digit code matches our internal salted checksum logic.
 */
export const verifyReferralCode = (code: string): boolean => {
  const trimmed = code.trim();
  if (!/^[0-9]{5}$/.test(trimmed)) return false;

  const base = trimmed.slice(0, 4);
  const providedChecksum = parseInt(trimmed.charAt(4), 10);
  const sum = base.split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const calculatedChecksum = (sum + SALT) % 10;

  return providedChecksum === calculatedChecksum;
};
