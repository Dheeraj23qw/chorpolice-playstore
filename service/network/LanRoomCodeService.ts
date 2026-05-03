import { NETWORK } from "@/constants/Networking";

export class LanRoomCodeService {
  private static readonly PRIMARY_PORT = NETWORK.TCP_SERVER_PORT || 41235;

  /**
   * Encodes host IP into a room code.
   * Always exactly 3 digits (last octet). No dashes, no port suffix. Ever.
   * Example: "192.168.1.16" → "016"
   */
  static encode(ip: string, _port?: number): string | null {
    const octets = ip.split(".").map((part) => Number(part));

    if (
      octets.length !== 4 ||
      octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
    ) {
      return null;
    }

    return octets[3].toString().padStart(3, "0");
  }

  /**
   * Generates a random 3-digit room code (100–999).
   */
  static generateRandom(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  /**
   * Parses a 3-digit room code string.
   * Always returns primary port — no port suffix is accepted or needed.
   */
  static parse(code: string): { code: string; port: number } | null {
    const clean = code.replace(/[^0-9]/g, "").slice(0, 3);
    if (clean.length < 1) return null;
    return { code: clean, port: this.PRIMARY_PORT };
  }

  /**
   * Validates a code is exactly 3 digits.
   */
  static isValid(code: string): boolean {
    return /^[0-9]{3}$/.test(code.trim());
  }
}
