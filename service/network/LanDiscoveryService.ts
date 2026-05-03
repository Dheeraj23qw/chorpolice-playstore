import dgram from "react-native-udp";
import Zeroconf from "react-native-zeroconf";
import { NETWORK } from "@/constants/Networking";
import { DiscoveryResult } from "./LanDiscoveryStrategy";
import { logLanDebug, updateDebugMetric } from "../observability/DebugService";

/**
 * Discovery broadcast strategy (in priority order):
 *
 * 1. SUBNET BROADCAST (primary — works on all standard home routers)
 *    e.g. 192.168.1.255 — derived from actual hostIp.
 *    Routers FORWARD subnet broadcasts within the LAN.
 *
 * 2. MULTICAST 224.0.0.1 (secondary — works on most hotspots)
 *    "All-hosts" multicast group. Many routers/hotspots allow this
 *    where they block 255.255.255.255.
 *    Listener must call addMembership('224.0.0.1') to receive.
 *
 * 3. COMMON HOTSPOT SUBNETS (fallback — covers Android/iOS hotspot ranges)
 *    192.168.43.255, 172.20.10.255, 192.168.49.255
 *
 * REMOVED: 255.255.255.255 (limited broadcast)
 *    Blocked by virtually all home routers AND personal hotspots.
 */
export class LanDiscoveryService {
  private static broadcastSocket: any = null;
  private static listenSocket: any = null;
  private static broadcastInterval: NodeJS.Timeout | null = null;

  private static readonly APP_ID = "chorpolice";
  private static readonly UDP_PORT = NETWORK.DISCOVERY_PORT || 41234;
  private static readonly MULTICAST_GROUP = "224.0.0.251"; // mDNS-style local multicast
  private static zeroconf = new Zeroconf();
  private static publishedServiceName: string | null = null;

  /**
   * HOST: Starts broadcasting lobby info via UDP.
   */
  static async startBroadcasting(payload: {
    roomCode: string;
    tcpPort: number;
    hostName: string;
    lobbyId: string;
    version: string;
    hostIp?: string;
  }) {
    await this.stopBroadcasting();

    logLanDebug(`[UDP] Starting broadcast: room=${payload.roomCode}, hostIp=${payload.hostIp}`);
    updateDebugMetric("lanUdpBroadcaster", "starting");

    if (!dgram || !dgram.createSocket) {
      logLanDebug("[UDP] dgram module not found — native build required.");
      updateDebugMetric("lanUdpBroadcaster", "failed");
      return;
    }

    this.broadcastSocket = dgram.createSocket({ type: "udp4", debug: false });

    this.broadcastSocket.on("error", (err: any) => {
      console.error("[UDP] Broadcaster error:", err);
      logLanDebug(`[UDP] Broadcaster error: ${err.message}`);
      updateDebugMetric("lanUdpBroadcaster", "error");
    });

    const broadcastData = JSON.stringify({
      appId: this.APP_ID,
      type: "LOBBY_DISCOVERY",
      ...payload,
    });

    /**
     * Build the list of broadcast targets in priority order.
     * 255.255.255.255 is intentionally excluded — it is blocked by
     * nearly all home routers and mobile hotspots.
     */
    const getTargets = (): string[] => {
      const targets = new Set<string>();

      // ① SUBNET BROADCAST (most reliable on home WiFi)
      const parts = payload.hostIp?.split(".");
      if (parts && parts.length === 4) {
        targets.add(`${parts[0]}.${parts[1]}.${parts[2]}.255`);
      }

      // ② MULTICAST — often allowed where broadcast is blocked
      targets.add(this.MULTICAST_GROUP);

      // ③ COMMON HOTSPOT SUBNETS (fallback for when IP isn't resolved yet)
      targets.add("192.168.43.255"); // Android hotspot default
      targets.add("192.168.49.255"); // Android WiFi Direct / Samsung
      targets.add("172.20.10.255");  // iOS Personal Hotspot
      targets.add("192.168.1.255");  // Most home routers
      targets.add("192.168.0.255");  // Alternate home router range

      return Array.from(targets);
    };

    const targets = getTargets();

    const sendToAll = () => {
      if (!this.broadcastSocket) return;
      targets.forEach((target) => {
        this.broadcastSocket.send(
          broadcastData,
          0,
          broadcastData.length,
          this.UDP_PORT,
          target,
          (_err: any) => { /* per-subnet errors are expected and silent */ }
        );
      });
    };

    this.broadcastSocket.bind(this.UDP_PORT, (err: any) => {
      if (err) {
        // Try binding to a random port as fallback if 41234 is in use
        console.error("[UDP] Bind error on port", this.UDP_PORT, err.message);
        updateDebugMetric("lanUdpBroadcaster", "failed");
        return;
      }

      // Enable broadcast mode for subnet broadcasts
      try {
        this.broadcastSocket.setBroadcast(true);
      } catch (e) {
        console.warn("[UDP] setBroadcast failed (may be OK on some devices):", e);
      }

      updateDebugMetric("lanUdpBroadcaster", "running");
      logLanDebug(`[UDP] Broadcaster ready → targets: ${targets.join(" | ")}`);
      console.log(`[UDP] Broadcasting to: ${targets.join(", ")}`);

      // Send immediately so joiner sees the room within ~1s, then repeat every 2s
      sendToAll();
      this.broadcastInterval = setInterval(sendToAll, 2000);
    });

    // 🚀 Start Zeroconf NSD Broadcasting
    try {
      const serviceName = `ChorPolice-${payload.roomCode}-${payload.lobbyId.substring(0, 4)}`;
      this.zeroconf.publishService(
        "chorpolice",
        "tcp",
        "local.",
        serviceName,
        payload.tcpPort,
        {
          appId: this.APP_ID,
          roomCode: payload.roomCode,
          hostName: payload.hostName,
          lobbyId: payload.lobbyId,
          version: payload.version,
          hostIp: payload.hostIp || "",
          protocolVersion: "1.0",
          timestamp: Date.now().toString(),
        }
      );
      this.publishedServiceName = serviceName; // Store for cleanup
      logLanDebug(`[NSD] Published Zeroconf service: ${serviceName}`);
    } catch (e) {
      console.warn("[NSD] Zeroconf publish failed", e);
    }
  }

  static async stopBroadcasting() {
    logLanDebug("[UDP] Stopping broadcast");
    updateDebugMetric("lanUdpBroadcaster", "idle");
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
    if (this.broadcastSocket) {
      try { this.broadcastSocket.close(); } catch (e) {}
      this.broadcastSocket = null;
    }
    
    try {
      if (this.publishedServiceName) {
        logLanDebug(`[NSD] Unpublishing Zeroconf service: ${this.publishedServiceName}`);
        this.zeroconf.unpublishService(this.publishedServiceName);
        this.publishedServiceName = null;
      }
    } catch (e) {
      console.warn("[NSD] Zeroconf unpublish failed", e);
    }
  }

  /**
   * JOINER: Starts listening for nearby lobbies.
   * Joins the multicast group so it can receive multicast packets
   * in addition to subnet broadcasts.
   */
  static startListening(onDiscovery: (result: DiscoveryResult) => void) {
    this.stopListening();

    logLanDebug("[UDP] Starting listener");
    updateDebugMetric("lanUdpListener", "listening");

    if (!dgram || !dgram.createSocket) {
      logLanDebug("[UDP] dgram module not found — native build required.");
      updateDebugMetric("lanUdpListener", "failed");
      return;
    }

    this.listenSocket = dgram.createSocket({ type: "udp4", debug: false });

    this.listenSocket.on("error", (err: any) => {
      console.error("[UDP] Listener error:", err);
      logLanDebug(`[UDP] Listener error: ${err.message}`);
      updateDebugMetric("lanUdpListener", "error");
    });

    this.listenSocket.on("message", (msg: any, rinfo: any) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.appId === this.APP_ID && data.type === "LOBBY_DISCOVERY") {
          // Use rinfo.address (actual sender IP) — NOT data.hostIp
          // rinfo gives us the real IP even if hostIp in payload is wrong/fallback
          const senderIp = rinfo.address;
          logLanDebug(`[UDP] Packet from ${senderIp}: room=${data.roomCode}, host=${data.hostName}`);
          updateDebugMetric("lanLastUdpPacket", `${senderIp} → ${data.hostName}`);
          onDiscovery({
            ip: senderIp,
            port: data.tcpPort,
            roomCode: data.roomCode,
            hostName: data.hostName,
            lobbyId: data.lobbyId,
            version: data.version,
            source: "udp",
          });
        }
      } catch (e) {
        // Malformed or non-chorpolice packet — ignore silently
      }
    });

    this.listenSocket.bind(this.UDP_PORT, (err: any) => {
      if (err) {
        console.error("[UDP] Listen bind error:", err);
        updateDebugMetric("lanUdpListener", "failed");
        return;
      }

      // Join multicast group so we receive multicast packets from the host
      try {
        this.listenSocket.addMembership(this.MULTICAST_GROUP);
        logLanDebug(`[UDP] Joined multicast group ${this.MULTICAST_GROUP}`);
      } catch (e) {
        // addMembership may fail on some Android devices / hotspot interfaces
        // That's OK — subnet broadcasts will still work
        console.warn("[UDP] Could not join multicast (subnet broadcast will cover this):", e);
      }

      console.log(`[UDP] Listener active on port ${this.UDP_PORT}`);
      updateDebugMetric("lanUdpListener", "listening");
    });

    // 🚀 Start Zeroconf NSD Listening
    this.zeroconf.on("resolved", (service) => {
      try {
        if (!service || !service.name.startsWith("ChorPolice-")) return;

        // Defensive TXT parsing (some platforms return array of strings, some return object)
        let txt: Record<string, string> = {};
        if (service.txt) {
          if (Array.isArray(service.txt)) {
            // Convert ["key=value", ...] to {key: "value", ...}
            service.txt.forEach((item) => {
              if (typeof item === 'string') {
                const [key, ...valParts] = item.split("=");
                if (key) txt[key] = valParts.join("=");
              }
            });
          } else if (typeof service.txt === 'object') {
            txt = service.txt as Record<string, string>;
          }
        }

        // Filtering Requirements
        if (txt.appId !== this.APP_ID) {
           logLanDebug(`[NSD] Ignored service ${service.name}: mismatched appId`);
           return;
        }
        if (!txt.lobbyId || !service.port) {
           logLanDebug(`[NSD] Ignored service ${service.name}: missing lobbyId or port`);
           return;
        }
        // Optionally ignore self if we are the host:
        // (Handled automatically by useLanDiscovery deduplication or game logic checking localPlayerId)

        let senderIp = "";
        if (service.addresses && service.addresses.length > 0) {
           senderIp = service.addresses[0];
        } else if (txt.hostIp) {
           senderIp = txt.hostIp;
        }

        if (senderIp) {
          logLanDebug(`[NSD] Discovered via Zeroconf from ${senderIp}`);
          onDiscovery({
            ip: senderIp,
            port: service.port,
            roomCode: txt.roomCode,
            hostName: txt.hostName,
            lobbyId: txt.lobbyId,
            version: txt.version,
            protocolVersion: txt.protocolVersion,
            playerCount: txt.playerCount ? parseInt(txt.playerCount, 10) : undefined,
            maxPlayers: txt.maxPlayers ? parseInt(txt.maxPlayers, 10) : undefined,
            source: "nsd",
          });
        }
      } catch (e) {
        console.warn("[NSD] Error processing resolved service:", e);
      }
    });

    this.zeroconf.on("error", (err) => {
      console.warn("[NSD] Zeroconf error:", err);
    });

    try {
      logLanDebug("[NSD] Started Zeroconf scan");
      this.zeroconf.scan("chorpolice", "tcp", "local.");
    } catch (e) {
      console.warn("[NSD] Zeroconf scan failed", e);
    }
  }

  static stopListening() {
    logLanDebug("[UDP] Stopping listener");
    updateDebugMetric("lanUdpListener", "idle");
    if (this.listenSocket) {
      try {
        // Leave multicast group cleanly
        this.listenSocket.dropMembership(this.MULTICAST_GROUP);
      } catch (e) {}
      try { this.listenSocket.close(); } catch (e) {}
      this.listenSocket = null;
    }

    try {
      this.zeroconf.stop();
      this.zeroconf.removeDeviceListeners();
    } catch (e) {}
  }
}
