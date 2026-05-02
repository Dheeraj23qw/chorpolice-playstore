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
/**
 * Encodes host IP into a room code.
 * - Standard: "001" (Last octet)
 * - Fallback: "001-236" (Last octet + last 3 digits of port)
 */
export const encodeRoomCode = (ip: string, port?: number): string | null => {
  const octets = ip.split(".").map((part) => Number(part));

  if (
    octets.length !== 4 ||
    octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null;
  }

  const lastOctet = octets[3].toString().padStart(3, "0");
  
  // If we're on a non-standard port, append the last 3 digits of the port (e.g. 41236 -> 236)
  if (port && port !== PRIMARY_PORT) {
    const portSuffix = (port % 1000).toString().padStart(3, "0");
    return `${lastOctet}-${portSuffix}`;
  }

  return lastOctet;
};

/**
 * Decodes the 3-digit room code using the joiner's own IP prefix.
 * Returns { ip, port } — port is always PRIMARY_PORT for manual code entry.
 *
 * Example: Code "055", Joiner IP "192.168.1.12" → { ip: "192.168.1.55", port: 41235 }
 */
/**
 * Decodes the 3-digit room code using the joiner's own IP prefix or gateway.
 * Returns { ip, port } — port is always PRIMARY_PORT for manual code entry.
 *
 * STRATEGY:
 * 1. Try joiner's IP prefix (e.g., 192.168.1.x)
 * 2. Try common Hotspot prefixes (192.168.43.x, 172.20.10.x)
 * 3. Use the Gateway IP if available.
 */
export const decodeRoomCodeWithLocalContext = (
  code: string,
  localIp: string | null,
  gatewayIp: string | null = null,
): { ip: string; port: number } | null => {
  const parts = code.split("-");
  const mainPart = parts[0].replace(/[^0-9]/g, "");
  const portPart = parts[1]?.replace(/[^0-9]/g, "");

  if (mainPart.length < 1 || mainPart.length > 3) return null;

  const lastOctet = parseInt(mainPart, 10);
  if (isNaN(lastOctet) || lastOctet < 0 || lastOctet > 255) return null;

  // Port logic: 
  // If portPart exists (e.g. '236'), reconstructed port is 41000 + 236 = 41236.
  // Otherwise use PRIMARY_PORT.
  let targetPort = PRIMARY_PORT;
  if (portPart && portPart.length === 3) {
    targetPort = 41000 + parseInt(portPart, 10);
  }

  // 1️⃣ Priority: Gateway IP (Most reliable on Hotspots)
  if (gatewayIp) {
    const parts = gatewayIp.split(".");
    if (parts.length === 4) {
      if (parseInt(parts[3], 10) === lastOctet) {
         return { ip: gatewayIp, port: targetPort };
      }
      return { ip: `${parts.slice(0, 3).join(".")}.${lastOctet}`, port: targetPort };
    }
  }

  // 2️⃣ Fallback: Local IP prefix
  if (localIp) {
    const parts = localIp.split(".");
    if (parts.length === 4) {
      return { ip: `${parts.slice(0, 3).join(".")}.${lastOctet}`, port: targetPort };
    }
  }

  // 3️⃣ Last Resort: Common Hotspot defaults
  return { ip: `192.168.43.${lastOctet}`, port: targetPort };
};

/** Legacy compat — callers should use decodeRoomCodeWithLocalContext */
export const decodeRoomCode = (_code: string): string | null => null;
