/**
 * Room Code: ALWAYS 3 digits. Simple. No dashes, no port suffix.
 * 
 * The QR code carries full { ip, port } JSON — that handles fallback ports.
 * The 3-digit manual code uses the primary port (41235) which works 99% of the time.
 */

const PRIMARY_PORT = 41235;

/**
 * Encodes host IP into a 3-digit room code (last octet, zero-padded).
 * Example: "192.168.1.55" → "055"
 */
export const encodeRoomCode = (ip: string, _port?: number): string | null => {
  const octets = ip.split(".").map((part) => Number(part));

  if (
    octets.length !== 4 ||
    octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null;
  }

  return octets[3].toString().padStart(3, "0");
};

/**
 * Decodes the 3-digit room code using the joiner's own IP prefix.
 * Returns { ip, port } — port is always PRIMARY_PORT for manual code entry.
 *
 * Example: Code "055", Joiner IP "192.168.1.12" → { ip: "192.168.1.55", port: 41235 }
 */
export const decodeRoomCodeWithLocalContext = (
  code: string,
  localIp: string | null,
): { ip: string; port: number } | null => {
  if (!localIp) return null;

  const cleaned = code.replace(/[^0-9]/g, "");
  if (cleaned.length < 1 || cleaned.length > 3) return null;

  const lastOctet = parseInt(cleaned, 10);
  if (isNaN(lastOctet) || lastOctet < 0 || lastOctet > 255) return null;

  const prefixParts = localIp.split(".");
  if (prefixParts.length !== 4) return null;

  const prefix = prefixParts.slice(0, 3).join(".");
  return { ip: `${prefix}.${lastOctet}`, port: PRIMARY_PORT };
};

/** Legacy compat — callers should use decodeRoomCodeWithLocalContext */
export const decodeRoomCode = (_code: string): string | null => null;
