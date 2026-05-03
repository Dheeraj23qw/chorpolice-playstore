export type DiscoverySource = "udp" | "multicast" | "gateway" | "fallback" | "subnet" | "nsd" | "qr";

export interface DiscoveryResult {
  lobbyId?: string;
  roomCode?: string;
  hostName?: string;
  hostIp?: string;
  ip: string;       // Maintain backward compatibility for IP connection
  port: number;
  playerCount?: number;
  maxPlayers?: number;
  source: DiscoverySource;
  sources?: DiscoverySource[];
  lastSeenAt?: number;
  protocolVersion?: string;
  version?: string; // Maintain backward compatibility
}

export interface LanDiscoveryOptions {
  appId: string;
  discoveryPort: number;
  tcpPort: number;
}
