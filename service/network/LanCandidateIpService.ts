export interface IpContext {
  localIp: string | null;
  gatewayIp: string | null;
}

export class LanCandidateIpService {
  private static readonly COMMON_HOTSPOT_PREFIXES = [
    "192.168.43",
    "192.168.49",
    "172.20.10",
    "192.168.1",
  ];

  /**
   * Generates a list of likely host IPs based on the current network context.
   * Useful when joining via manual room code or as a fallback.
   */
  static getCandidateIps(lastOctet: number, ctx: IpContext): string[] {
    const candidates = new Set<string>();

    // 1. Gateway based (most reliable on hotspots)
    if (ctx.gatewayIp) {
      const parts = ctx.gatewayIp.split(".");
      if (parts.length === 4) {
        candidates.add(`${parts[0]}.${parts[1]}.${parts[2]}.${lastOctet}`);
      }
    }

    // 2. Local prefix based (for router WiFi)
    if (ctx.localIp) {
      const parts = ctx.localIp.split(".");
      if (parts.length === 4) {
        candidates.add(`${parts[0]}.${parts[1]}.${parts[2]}.${lastOctet}`);
      }
    }

    // 3. Common hotspot defaults
    for (const prefix of this.COMMON_HOTSPOT_PREFIXES) {
      candidates.add(`${prefix}.${lastOctet}`);
    }

    return Array.from(candidates);
  }

  /**
   * Returns a static list of common gateway IPs.
   */
  static getCommonGateways(): string[] {
    return [
      "192.168.43.1",
      "192.168.49.1",
      "172.20.10.1",
      "192.168.1.1",
      "192.168.0.1",
      "10.0.0.1",
    ];
  }
}
