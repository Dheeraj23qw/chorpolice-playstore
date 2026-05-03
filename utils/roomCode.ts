/**
 * Room Code: ALWAYS exactly 3 digits. No dashes, no port suffix. Ever.
 *
 * The QR code carries full { ip, port } JSON — that handles non-standard ports.
 * The 3-digit manual code uses the primary port (41235) which works 99% of the time.
 */

const PRIMARY_PORT = 41235;

/**
 * Encodes host IP into a 3-digit room code (last octet, zero-padded).
 * Always exactly 3 digits — no dashes, no port suffix.
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

  // Always 3 digits. Port is handled by QR payload JSON, not the manual code.
  return octets[3].toString().padStart(3, "0");
};

/**
 * Decodes the 3-digit room code using the joiner's own IP prefix.
 * Returns { ip, port } — port is always PRIMARY_PORT for manual code entry.
 *
 * Example: Code "055", Joiner IP "192.168.1.12" → { ip: "192.168.1.55", port: 41235 }
 *
 * STRATEGY:
 * 1. Try Gateway IP prefix (most reliable on hotspots)
 * 2. Try joiner's IP prefix (e.g., 192.168.1.x)
 * 3. Common hotspot defaults
 */
export const decodeRoomCodeWithLocalContext = (
  code: string,
  localIp: string | null,
  gatewayIp: string | null = null,
): { ip: string; port: number } | null => {
  const mainPart = code.replace(/[^0-9]/g, "").slice(0, 3);

  if (mainPart.length < 1) return null;

  const lastOctet = parseInt(mainPart, 10);
  if (isNaN(lastOctet) || lastOctet < 0 || lastOctet > 255) return null;

  // 1️⃣ Priority: Gateway IP
  if (gatewayIp) {
    const parts = gatewayIp.split(".");
    if (parts.length === 4) {
      if (parseInt(parts[3], 10) === lastOctet) {
        return { ip: gatewayIp, port: PRIMARY_PORT };
      }
      return { ip: `${parts.slice(0, 3).join(".")}.${lastOctet}`, port: PRIMARY_PORT };
    }
  }

  // 2️⃣ Local IP prefix
  if (localIp) {
    const parts = localIp.split(".");
    if (parts.length === 4) {
      return { ip: `${parts.slice(0, 3).join(".")}.${lastOctet}`, port: PRIMARY_PORT };
    }
  }

  // 3️⃣ Last resort: most common hotspot default
  return { ip: `192.168.43.${lastOctet}`, port: PRIMARY_PORT };
};

/**
 * Returns a list of potential IPs for a 3-digit room code.
 */
export const getCandidateIpsForRoomCode = (
  code: string,
  localIp: string | null,
  gatewayIp: string | null = null,
): string[] => {
  const mainPart = code.replace(/[^0-9]/g, "").slice(0, 3);
  if (!mainPart) return [];

  const lastOctet = parseInt(mainPart, 10);
  if (isNaN(lastOctet) || lastOctet < 0 || lastOctet > 255) return [];

  const candidates = new Set<string>();

  // 1. Gateway based
  if (gatewayIp) {
    const p = gatewayIp.split(".");
    if (p.length === 4) candidates.add(`${p[0]}.${p[1]}.${p[2]}.${lastOctet}`);
  }

  // 2. Local prefix based
  if (localIp) {
    const p = localIp.split(".");
    if (p.length === 4) candidates.add(`${p[0]}.${p[1]}.${p[2]}.${lastOctet}`);
  }

  // 3. Common hotspot/router defaults
  candidates.add(`192.168.43.${lastOctet}`);
  candidates.add(`192.168.49.${lastOctet}`);
  candidates.add(`172.20.10.${lastOctet}`);
  candidates.add(`192.168.1.${lastOctet}`);
  candidates.add(`192.168.0.${lastOctet}`);
  candidates.add(`10.0.0.${lastOctet}`);

  return Array.from(candidates);
};

/** Legacy compat */
export const decodeRoomCode = (_code: string): string | null => null;
