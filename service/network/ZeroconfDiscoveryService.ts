/**
 * ZeroconfDiscoveryService
 *
 * Wraps react-native-zeroconf for mDNS service publish/browse.
 * Service type: _chorpolice-game._tcp.local.
 *
 * WHY NOT UDP BROADCAST?
 * - Android 12+ blocks broadcast on many networks without NEARBY_WIFI_DEVICES
 * - Routers with multicast filtering drop 255.255.255.255 packets
 * - Zeroconf is the standard for LAN service discovery (same as AirDrop, Chromecast)
 */
import { Platform } from "react-native";
import Zeroconf from "react-native-zeroconf";
import { NETWORK } from "@/constants/Networking";
import { updateDebugMetric } from "../observability/DebugService";

export type DiscoveredHost = {
  name: string;
  ip: string;
  port: number;
  lobbyName: string;
  playerCount: number;
  gameVersion: string;
  hostPlayerId: string;
  lastSeen: number;
};

type DiscoveryListener = (hosts: DiscoveredHost[]) => void;

let zeroconfInstance: Zeroconf | null = null;
let isPublishing = false;
let isScanning = false;
let publishedServiceName: string | null = null;

const discoveredHosts = new Map<string, DiscoveredHost>();
const listeners = new Set<DiscoveryListener>();
const serviceInstanceId = Math.random().toString(36).slice(2, 8);
const ZEROCONF_DOMAIN = "local.";
const ZEROCONF_IMPL = Platform.OS === "android" ? "DNSSD" : undefined;

const notifyListeners = () => {
  const hosts = Array.from(discoveredHosts.values());
  listeners.forEach((listener) => listener(hosts));
};

const getServiceName = (lobbyName: string) => {
  const normalized = lobbyName
    .trim()
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

  return `chorpolice-${normalized || "lobby"}-${serviceInstanceId}`;
};

const getZeroconf = (): Zeroconf => {
  if (!zeroconfInstance) {
    zeroconfInstance = new Zeroconf();
  }
  return zeroconfInstance;
};

export const ZeroconfDiscoveryService = {
  /**
   * HOST: Publish the lobby as a Zeroconf service.
   * Other devices on the LAN can discover this service.
   */
  publishService: (config: {
    lobbyName: string;
    playerCount: number;
    hostPlayerId: string;
    port?: number;
  }) => {
    if (isPublishing) {
      ZeroconfDiscoveryService.unpublishService();
    }

    const zc = getZeroconf();
    const port = config.port ?? NETWORK.TCP_SERVER_PORT;
    const serviceName = getServiceName(config.lobbyName);

    try {
      zc.publishService(
        NETWORK.ZEROCONF_SERVICE_TYPE,
        NETWORK.ZEROCONF_PROTOCOL,
        ZEROCONF_DOMAIN,
        serviceName,
        port,
        {
          lobbyName: config.lobbyName,
          playerCount: String(config.playerCount),
          gameVersion: NETWORK.GAME_VERSION,
          hostPlayerId: config.hostPlayerId,
          protocolVersion: NETWORK.PROTOCOL_VERSION,
        },
        ZEROCONF_IMPL,
      );

      isPublishing = true;
      publishedServiceName = serviceName;

      if (__DEV__) {
        console.log(
          `[Zeroconf] Published ${serviceName} on ${port} via ${ZEROCONF_IMPL ?? "default"} impl`,
        );
      }
    } catch (error) {
      console.error("[Zeroconf] Failed to publish service:", error);
    }
  },

  /**
   * Update TXT record metadata (e.g., when playerCount changes).
   * Unpublishes and re-publishes with new metadata.
   */
  updateServiceMetadata: (config: {
    lobbyName: string;
    playerCount: number;
    hostPlayerId: string;
    port?: number;
  }) => {
    if (!isPublishing) return;

    // Zeroconf doesn't support live TXT updates; re-register
    ZeroconfDiscoveryService.unpublishService();
    ZeroconfDiscoveryService.publishService(config);
  },

  /**
   * HOST: Stop publishing the service.
   */
  unpublishService: () => {
    if (!isPublishing || !zeroconfInstance || !publishedServiceName) return;

    try {
      zeroconfInstance.unpublishService(publishedServiceName, ZEROCONF_IMPL);
      isPublishing = false;
      publishedServiceName = null;

      if (__DEV__) {
        console.log("[Zeroconf] Service unpublished.");
      }
    } catch (error) {
      console.error("[Zeroconf] Failed to unpublish service:", error);
    }
  },

  /**
   * CLIENT: Start scanning for lobby services on the LAN.
   */
  startScan: () => {
    if (isScanning) return;

    const zc = getZeroconf();
    discoveredHosts.clear();
    zc.removeAllListeners();

    zc.on("resolved", (service: any) => {
      if (!service || !service.host) return;

      // Extract TXT records
      const txt = service.txt || {};
      const ip =
        service.addresses?.find(
          (addr: string) =>
            addr.includes(".") && !addr.startsWith("127."),
        ) || service.host;

      // Verify protocol version compatibility
      if (
        txt.protocolVersion &&
        txt.protocolVersion !== NETWORK.PROTOCOL_VERSION
      ) {
        if (__DEV__) {
          console.warn(
            `[Zeroconf] Ignoring host with incompatible protocol: ${txt.protocolVersion} (expected ${NETWORK.PROTOCOL_VERSION})`,
          );
        }
        return;
      }

      const host: DiscoveredHost = {
        name: service.name || txt.lobbyName || "Unknown",
        ip,
        port: service.port || NETWORK.TCP_SERVER_PORT,
        lobbyName: txt.lobbyName || service.name || "Unknown Lobby",
        playerCount: parseInt(txt.playerCount || "1", 10),
        gameVersion: txt.gameVersion || "unknown",
        hostPlayerId: txt.hostPlayerId || "unknown",
        lastSeen: Date.now(),
      };

      discoveredHosts.set(ip, host);
      updateDebugMetric("discoveredHostCount", discoveredHosts.size);

      if (__DEV__) {
        console.log(
          `[Zeroconf] Resolved host: ${host.lobbyName} @ ${ip}:${host.port} (${host.playerCount} players)`,
        );
      }

      notifyListeners();
    });

    zc.on("remove", (serviceName: string) => {
      // Find and remove the host by service name
      for (const [ip, host] of discoveredHosts.entries()) {
        if (host.name === serviceName) {
          discoveredHosts.delete(ip);
          updateDebugMetric("discoveredHostCount", discoveredHosts.size);

          if (__DEV__) {
            console.log(`[Zeroconf] Host removed: ${serviceName} @ ${ip}`);
          }

          notifyListeners();
          break;
        }
      }
    });

    zc.on("error", (error: any) => {
      console.error("[Zeroconf] Scan error:", error);
    });

    zc.on("start", () => {
      if (__DEV__) {
        console.log(
          `[Zeroconf] Scanning for _${NETWORK.ZEROCONF_SERVICE_TYPE}._${NETWORK.ZEROCONF_PROTOCOL} services...`,
        );
      }
    });

    try {
      zc.scan(
        NETWORK.ZEROCONF_SERVICE_TYPE,
        NETWORK.ZEROCONF_PROTOCOL,
        ZEROCONF_DOMAIN,
        ZEROCONF_IMPL,
      );
      isScanning = true;
    } catch (error) {
      console.error("[Zeroconf] Failed to start scan:", error);
    }
  },

  /**
   * CLIENT: Stop scanning for services.
   */
  stopScan: () => {
    if (!isScanning || !zeroconfInstance) return;

    try {
      zeroconfInstance.stop(ZEROCONF_IMPL);
      zeroconfInstance.removeAllListeners();
      isScanning = false;
      discoveredHosts.clear();
      updateDebugMetric("discoveredHostCount", 0);
      notifyListeners();

      if (__DEV__) {
        console.log("[Zeroconf] Scan stopped.");
      }
    } catch (error) {
      console.error("[Zeroconf] Failed to stop scan:", error);
    }
  },

  /**
   * Subscribe to host changes. Returns unsubscribe function.
   */
  subscribe: (listener: DiscoveryListener): (() => void) => {
    listeners.add(listener);
    // Immediately notify with current state
    listener(Array.from(discoveredHosts.values()));
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Get current discovered hosts snapshot.
   */
  getHosts: (): DiscoveredHost[] => Array.from(discoveredHosts.values()),

  /**
   * Full cleanup. Call when leaving the lobby entirely.
   */
  destroy: () => {
    ZeroconfDiscoveryService.stopScan();
    ZeroconfDiscoveryService.unpublishService();
    listeners.clear();
    discoveredHosts.clear();

    if (zeroconfInstance) {
      try {
        zeroconfInstance.removeAllListeners();
        zeroconfInstance.removeDeviceListeners();
      } catch {
        // ignore
      }
      zeroconfInstance = null;
    }

    isPublishing = false;
    isScanning = false;
    publishedServiceName = null;
    updateDebugMetric("discoveredHostCount", 0);
    notifyListeners();
  },

  /** Expose state for debugging */
  isPublishing: () => isPublishing,
  isScanning: () => isScanning,
};
