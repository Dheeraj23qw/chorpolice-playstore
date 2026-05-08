import dgram from "react-native-udp";
import Zeroconf from "react-native-zeroconf";
import { NETWORK } from "@/constants/Networking";
import { DiscoveryResult } from "./LanDiscoveryStrategy";
import { logLanDebug, updateDebugMetric } from "../observability/DebugService";
import store from "@/redux/store";

/**
 * LanDiscoveryService — Production-hardened UDP + Zeroconf room discovery.
 *
 * ARCHITECTURE RULES:
 * - Discovery is a "radar" — it only finds nearby rooms.
 * - Discovery NEVER sends gameplay packets.
 * - TCP remains the ONLY gameplay/lobby transport.
 * - Discovery failure is silent/recoverable, never fatal.
 * - QR scan and Room Code join must always work independently.
 *
 * Broadcast strategy (host, priority order):
 *  1. SUBNET BROADCAST  (e.g. 192.168.1.255) — works on standard routers
 *  2. MULTICAST 224.0.0.251 — works on most hotspots
 *  3. COMMON HOTSPOT SUBNETS — fallback for Android/iOS hotspot ranges
 *
 * Listen strategy (joiner):
 *  1. UDP listener on discovery port (with fallback port if bind fails)
 *  2. Zeroconf/NSD scan for "_chorpolice._tcp" services
 *  Both feed into the same onDiscovery callback.
 */
export class LanDiscoveryService {
  // ── Socket state ──
  private static broadcastSocket: any = null;
  private static listenSocket: any = null;
  private static broadcastInterval: NodeJS.Timeout | null = null;
  private static queryInterval: NodeJS.Timeout | null = null;
  private static bindRetryTimeout: NodeJS.Timeout | null = null;
  private static isBroadcasting = false;
  private static isListening = false;
  private static fallbackDeviceId: string | null = null;
  private static listenRunId = 0;

  // ── Constants ──
  private static readonly APP_ID = "chorpolice";
  private static readonly UDP_PORT = NETWORK.DISCOVERY_PORT || 41234;
  private static readonly MULTICAST_GROUP = "224.0.0.251";
  private static readonly BROADCAST_INTERVAL_MS = 2500; // Production timing
  private static readonly MAX_BIND_RETRIES = 3;

  // ── Zeroconf state ──
  private static zeroconf: Zeroconf | null = null;
  private static publishedServiceName: string | null = null;
  private static zeroconfRescanInterval: NodeJS.Timeout | null = null;
  private static zeroconfResolvedHandler: ((service: any) => void) | null = null;
  private static zeroconfErrorHandler: ((err: any) => void) | null = null;

  // ── Self-filtering (host must not discover its own room) ──
  private static currentHostLobbyId: string | null = null;

  private static getSessionDeviceId(): string {
    const state = store.getState().session;
    if (state.deviceId) return state.deviceId;
    
    if (!this.fallbackDeviceId) {
      this.fallbackDeviceId = `session_${Math.random().toString(36).substring(2, 10)}`;
    }
    return this.fallbackDeviceId;
  }

  // ═════════════════════════════════════════════════════════════════════
  //  HOST: Broadcasting
  // ═════════════════════════════════════════════════════════════════════

  /**
   * HOST: Starts broadcasting lobby info via UDP + Zeroconf.
   * Safe to call multiple times — will stop previous broadcast first.
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
    this.currentHostLobbyId = payload.lobbyId;
    this.isBroadcasting = true;

    logLanDebug(`[Discovery] Starting broadcast: room=${payload.roomCode}, hostIp=${payload.hostIp}`);
    updateDebugMetric("lanUdpBroadcaster", "starting");

    // ── UDP Broadcasting ──
    this.startUdpBroadcast(payload);

    // ── Zeroconf Publishing ──
    this.startZeroconfPublish(payload);
  }

  private static startUdpBroadcast(payload: {
    roomCode: string;
    tcpPort: number;
    hostName: string;
    lobbyId: string;
    version: string;
    hostIp?: string;
  }, retryCount = 0) {
    if (!dgram?.createSocket) {
      logLanDebug("[Discovery] dgram module not found — native build required.");
      updateDebugMetric("lanUdpBroadcaster", "failed");
      return;
    }

    try {
      this.broadcastSocket = dgram.createSocket({ type: "udp4", debug: false });
    } catch (e) {
      console.warn("[Discovery] Failed to create UDP socket:", e);
      updateDebugMetric("lanUdpBroadcaster", "failed");
      return;
    }

    this.broadcastSocket.on("error", (err: any) => {
      console.warn("[Discovery] Broadcaster socket error:", err?.message);
      logLanDebug(`[Discovery] Broadcaster error: ${err?.message}`);
      updateDebugMetric("lanUdpBroadcaster", "error");
    });

    // Handle active probe queries from clients
    this.broadcastSocket.on("message", (msg: any, rinfo: any) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.appId === this.APP_ID && data.type === "DISCOVERY_QUERY") {
          logLanDebug(`[Discovery] Received query from ${rinfo.address}:${rinfo.port}. Replying...`);
          const replyData = JSON.stringify({
            appId: this.APP_ID,
            type: "DISCOVERY_ANNOUNCE",
            deviceId: this.getSessionDeviceId(),
            ...payload,
          });
          this.broadcastSocket.send(
            replyData, 0, replyData.length,
            rinfo.port, rinfo.address,
            () => {}
          );
        }
      } catch {
        // Ignore malformed packets
      }
    });

    // Build deduplicated list of broadcast targets
    const targets = this.getBroadcastTargets(payload.hostIp);

    const sendToAll = () => {
      if (!this.broadcastSocket) return;
      
      const state = store.getState().session;
      const playerCount = state.players.length;
      
      const broadcastData = JSON.stringify({
        appId: this.APP_ID,
        type: "LOBBY_DISCOVERY",
        deviceId: this.getSessionDeviceId(),
        ...payload,
        playerCount,
        maxPlayers: 4,
        gameType: state.gameType,
      });

      console.log(`[LAN][DISCOVERY] Host announcement sent { playerCount: ${playerCount} }`);

      for (const target of targets) {
        try {
          this.broadcastSocket.send(
            broadcastData, 0, broadcastData.length,
            this.UDP_PORT, target,
            () => { /* per-target errors are expected and silent */ }
          );
        } catch {
          // Individual send failures are expected on some networks
        }
      }
    };

    // Host ALWAYS tries to bind to the primary discovery port
    const bindPort = this.UDP_PORT;

    this.broadcastSocket.bind(bindPort, (err: any) => {
      if (err) {
        console.warn(`[Discovery] Bind error on port ${bindPort}:`, err?.message);

        // Retry binding the same port (max 3 attempts)
        if (retryCount < this.MAX_BIND_RETRIES) {
          logLanDebug(`[Discovery] Host bind retry ${retryCount + 1}/${this.MAX_BIND_RETRIES}`);
          this.safeCloseSocket("broadcastSocket");
          this.bindRetryTimeout = setTimeout(() => {
            if (!this.isBroadcasting) return;
            this.startUdpBroadcast(payload, retryCount + 1);
          }, 2000);
        } else {
          logLanDebug("[Discovery] All bind retries exhausted. UDP broadcast unavailable.");
          updateDebugMetric("lanUdpBroadcaster", "failed");
        }
        return;
      }

      // Enable broadcast mode for subnet broadcasts
      try { this.broadcastSocket?.setBroadcast(true); } catch {
        // May fail on some devices — multicast will still work
      }

      updateDebugMetric("lanUdpBroadcaster", "running");
      logLanDebug(`[Discovery] Broadcaster ready → ${targets.length} targets`);
      console.log(`[Discovery] Broadcasting to: ${targets.join(", ")}`);

      // Send immediately, then repeat every 2s
      sendToAll();
      this.broadcastInterval = setInterval(sendToAll, this.BROADCAST_INTERVAL_MS);
    });
  }

  private static getBroadcastTargets(hostIp?: string): string[] {
    const targets = new Set<string>();

    // ① SUBNET BROADCAST (most reliable on home WiFi)
    const parts = hostIp?.split(".");
    if (parts?.length === 4) {
      targets.add(`${parts[0]}.${parts[1]}.${parts[2]}.255`);
    }

    // ② MULTICAST — often allowed where broadcast is blocked
    targets.add(this.MULTICAST_GROUP);

    // ③ COMMON HOTSPOT SUBNETS (fallback)
    targets.add("192.168.43.255"); // Android hotspot default
    targets.add("192.168.49.255"); // Android WiFi Direct / Samsung
    targets.add("172.20.10.255");  // iOS Personal Hotspot
    targets.add("192.168.1.255");  // Most home routers
    targets.add("192.168.0.255");  // Alternate home router range

    return Array.from(targets);
  }

  private static startZeroconfPublish(payload: {
    roomCode: string;
    tcpPort: number;
    hostName: string;
    lobbyId: string;
    version: string;
    hostIp?: string;
  }) {
    try {
      const zc = this.getZeroconf();
      const serviceName = `ChorPolice-${payload.roomCode}-${payload.lobbyId.substring(0, 4)}`;

      zc.publishService(
        "chorpolice", "tcp", "local.",
        serviceName, payload.tcpPort,
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
      this.publishedServiceName = serviceName;
      logLanDebug(`[Discovery] [NSD] Published Zeroconf: ${serviceName}`);
    } catch (e) {
      // Zeroconf publish failure is non-fatal — UDP still works
      console.warn("[Discovery] [NSD] Zeroconf publish failed (non-fatal):", e);
    }
  }

  static async stopBroadcasting() {
    logLanDebug("[Discovery] Stopping broadcast");
    updateDebugMetric("lanUdpBroadcaster", "idle");
    this.currentHostLobbyId = null;
    this.isBroadcasting = false;

    // Clear interval
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
    if (this.bindRetryTimeout) {
      clearTimeout(this.bindRetryTimeout);
      this.bindRetryTimeout = null;
    }

    // Close UDP socket
    this.safeCloseSocket("broadcastSocket");

    // Unpublish Zeroconf
    try {
      if (this.publishedServiceName) {
        logLanDebug(`[Discovery] [NSD] Unpublishing: ${this.publishedServiceName}`);
        this.getZeroconf().unpublishService(this.publishedServiceName);
        this.publishedServiceName = null;
      }
    } catch (e) {
      console.warn("[Discovery] [NSD] Unpublish failed (non-fatal):", e);
      this.publishedServiceName = null;
    }
  }

  // ═════════════════════════════════════════════════════════════════════
  //  JOINER: Listening
  // ═════════════════════════════════════════════════════════════════════

  /**
   * JOINER: Starts listening for nearby lobbies via UDP + Zeroconf.
   * All discoveries are merged and deduplicated by useLanDiscovery hook.
   */
  static startListening(onDiscovery: (result: DiscoveryResult) => void) {
    const runId = ++this.listenRunId;

    // Synchronously close any existing listen socket so the new one can bind.
    // Do NOT call full stopListening (that would reset listenRunId guard).
    if (this.listenSocket) {
      const old = this.listenSocket;
      this.listenSocket = null;
      try { old.dropMembership(this.MULTICAST_GROUP); } catch {}
      try { old.close(); } catch {}
    }
    if (this.queryInterval) {
      clearInterval(this.queryInterval);
      this.queryInterval = null;
    }
    if (this.bindRetryTimeout) {
      clearTimeout(this.bindRetryTimeout);
      this.bindRetryTimeout = null;
    }

    // Restart Zeroconf scan cleanly.
    this.removeZeroconfHandlers();
    if (this.zeroconfRescanInterval) {
      clearInterval(this.zeroconfRescanInterval);
      this.zeroconfRescanInterval = null;
    }
    try { this.getZeroconf().stop(); } catch {}

    this.isListening = true;

    logLanDebug(`[Discovery] Starting discovery listener runId=${runId}`);
    console.log(`[LAN][DISCOVERY] Listener start requested runId=${runId}`);
    updateDebugMetric("lanUdpListener", "listening");

    // ── UDP Listener ──
    this.startUdpListener(onDiscovery);

    // ── Zeroconf Scanner ──
    this.startZeroconfScan(onDiscovery);
  }

  private static startUdpListener(
    onDiscovery: (result: DiscoveryResult) => void,
    retryCount = 0,
  ) {
    if (!dgram?.createSocket) {
      logLanDebug("[Discovery] dgram module not found — native build required.");
      updateDebugMetric("lanUdpListener", "failed");
      return;
    }

    try {
      this.listenSocket = dgram.createSocket({ type: "udp4", debug: false });
    } catch (e) {
      console.warn("[Discovery] Failed to create listen socket:", e);
      updateDebugMetric("lanUdpListener", "failed");
      return;
    }

    this.listenSocket.on("error", (err: any) => {
      console.warn("[Discovery] Listener socket error:", err?.message);
      logLanDebug(`[Discovery] Listener error: ${err?.message}`);
      updateDebugMetric("lanUdpListener", "error");
    });

    this.listenSocket.on("message", (msg: any, rinfo: any) => {
      try {
        const data = JSON.parse(msg.toString());

        // ── VALIDATION: Only process our app's discovery packets ──
        if (data.appId !== this.APP_ID || (data.type !== "LOBBY_DISCOVERY" && data.type !== "DISCOVERY_ANNOUNCE")) return;

        // ── SELF-FILTER: Skip our own broadcasts ──
        const state = store.getState().session;
        const localDeviceIps = [state.localIp].filter(Boolean); // Expandable to multiple IPs
        
        if (data.deviceId === this.getSessionDeviceId()) return;
        if (data.deviceId === state.deviceId) return;
        if (this.currentHostLobbyId && data.lobbyId === this.currentHostLobbyId) return;
        if (data.hostIp && localDeviceIps.includes(data.hostIp)) return;

        const senderIp = rinfo.address;
        logLanDebug(`[Discovery] UDP packet from ${senderIp}: room=${data.roomCode}, host=${data.hostName}`);
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
      } catch {
        // Malformed or non-chorpolice packet — ignore silently
      }
    });

    // Try primary port, then random fallback
    const bindPort = retryCount === 0 ? this.UDP_PORT : 0;
    const currentRunId = this.listenRunId;

    this.listenSocket.bind(bindPort, (err: any) => {
      if (currentRunId !== this.listenRunId) {
        console.log("[LAN][DISCOVERY] Stale listener callback ignored");
        try { this.listenSocket.close(); } catch {}
        this.listenSocket = null;
        return;
      }

      if (err) {
        console.warn(`[Discovery] Listen bind error on port ${bindPort}:`, err?.message);

        if (retryCount < this.MAX_BIND_RETRIES) {
          logLanDebug(`[Discovery] Listen bind retry ${retryCount + 1}/${this.MAX_BIND_RETRIES}`);
          this.safeCloseSocket("listenSocket");
          this.bindRetryTimeout = setTimeout(() => {
            if (!this.isListening) return;
            this.startUdpListener(onDiscovery, retryCount + 1);
          }, 300 * (retryCount + 1));
        } else {
          logLanDebug("[Discovery] All listen bind retries exhausted. UDP discovery unavailable (Zeroconf/QR/Code still work).");
          updateDebugMetric("lanUdpListener", "failed");
        }
        return;
      }

      // Join multicast group for multicast packets from host
      try {
        this.listenSocket?.addMembership(this.MULTICAST_GROUP);
        logLanDebug(`[Discovery] Joined multicast group ${this.MULTICAST_GROUP}`);
      } catch {
        // addMembership may fail on some Android devices / hotspot interfaces
        // Subnet broadcasts will still work
      }

      console.log(`[LAN][DISCOVERY] Listener active runId=${currentRunId}`);
      updateDebugMetric("lanUdpListener", "listening");

      // 🚀 Active Probe Mode: Send queries periodically
      const targets = this.getBroadcastTargets();
      const queryData = JSON.stringify({
        appId: this.APP_ID,
        type: "DISCOVERY_QUERY",
      });

      const sendQuery = () => {
        if (!this.listenSocket) return;
        targets.forEach((target) => {
          try {
            this.listenSocket.send(
              queryData, 0, queryData.length,
              this.UDP_PORT, target,
              () => {}
            );
          } catch {
            // Ignore
          }
        });
      };

      sendQuery(); // Send immediately
      this.queryInterval = setInterval(sendQuery, 3000);
    });
  }

  private static startZeroconfScan(onDiscovery: (result: DiscoveryResult) => void) {
    const zc = this.getZeroconf();

    // ── Remove any stale handlers first ──
    this.removeZeroconfHandlers();

    // ── Create fresh handlers ──
    this.zeroconfResolvedHandler = (service: any) => {
      try {
        if (!service?.name?.startsWith("ChorPolice-")) return;

        // Defensive TXT parsing (some platforms return array, some return object)
        const txt = this.parseZeroconfTxt(service.txt);

        // Validation
        if (txt.appId !== this.APP_ID) return;
        if (!txt.lobbyId || !service.port) return;

        // Self-filter
        if (this.currentHostLobbyId && txt.lobbyId === this.currentHostLobbyId) return;

        // Extract IP from service addresses or TXT record
        let senderIp = "";
        if (service.addresses?.length > 0) {
          // Prefer IPv4 addresses
          senderIp = service.addresses.find((a: string) => /^\d+\.\d+\.\d+\.\d+$/.test(a))
            || service.addresses[0];
        } else if (txt.hostIp) {
          senderIp = txt.hostIp;
        }

        if (!senderIp) return;

        logLanDebug(`[Discovery] [NSD] Resolved: ${senderIp} room=${txt.roomCode}`);
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
      } catch (e) {
        console.warn("[Discovery] [NSD] Error processing resolved service:", e);
      }
    };

    this.zeroconfErrorHandler = (err: any) => {
      console.warn("[Discovery] [NSD] Zeroconf error (non-fatal):", err);
    };

    zc.on("resolved", this.zeroconfResolvedHandler);
    zc.on("error", this.zeroconfErrorHandler);

    try {
      logLanDebug("[Discovery] [NSD] Starting Zeroconf scan");
      zc.scan("chorpolice", "tcp", "local.");
    } catch (e) {
      console.warn("[Discovery] [NSD] Zeroconf scan start failed (non-fatal):", e);
    }

    // ── Periodic re-scan (Zeroconf can go stale on some Android OEMs) ──
    this.zeroconfRescanInterval = setInterval(() => {
      try {
        zc.scan("chorpolice", "tcp", "local.");
      } catch {
        // Silent — previous scan results are still valid
      }
    }, 20000); // Production timing
  }

  static stopListening(opts?: { runId?: number }) {
    // If caller explicitly provides a runId that is older than current, ignore.
    // If no runId provided (e.g. external stop from coordinator), always execute.
    if (opts?.runId !== undefined && opts.runId < this.listenRunId) {
      console.log("[LAN][DISCOVERY] Stop ignored: newer listener active");
      return;
    }

    logLanDebug("[LAN][DISCOVERY] Discovery stopped safely");
    console.log("[LAN][DISCOVERY] Discovery stopped safely");
    updateDebugMetric("lanUdpListener", "idle");
    this.isListening = false;

    // ── UDP cleanup ──
    if (this.listenSocket) {
      const socketToClose = this.listenSocket;
      this.listenSocket = null;
      try { socketToClose.dropMembership(this.MULTICAST_GROUP); } catch {}
      try { socketToClose.close(); } catch {}
    }

    if (this.queryInterval) {
      clearInterval(this.queryInterval);
      this.queryInterval = null;
    }
    if (this.bindRetryTimeout) {
      clearTimeout(this.bindRetryTimeout);
      this.bindRetryTimeout = null;
    }

    // ── Zeroconf cleanup ──
    if (this.zeroconfRescanInterval) {
      clearInterval(this.zeroconfRescanInterval);
      this.zeroconfRescanInterval = null;
    }

    this.removeZeroconfHandlers();

    try {
      this.getZeroconf().stop();
    } catch {}
  }

  // ═════════════════════════════════════════════════════════════════════
  //  Helpers
  // ═════════════════════════════════════════════════════════════════════

  /** Safely close a socket by field name, nullifying immediately to prevent races */
  private static safeCloseSocket(field: "broadcastSocket" | "listenSocket") {
    const socket = this[field];
    if (!socket) return;
    (this as any)[field] = null;
    try { socket.close(); } catch {}
  }

  /** Lazily create Zeroconf instance (some OEMs crash on import) */
  private static getZeroconf(): any {
    if (!this.zeroconf) {
      try {
        this.zeroconf = new Zeroconf();
      } catch (e) {
        console.warn("[Discovery] [NSD] Cannot create Zeroconf instance:", e);
        // Return a no-op stub to prevent crashes
        this.zeroconf = {
          publishService: () => {},
          unpublishService: () => {},
          scan: () => {},
          stop: () => {},
          on: () => {},
          removeListener: () => {},
          removeAllListeners: () => {},
          removeDeviceListeners: () => {},
        } as any;
      }
    }
    return this.zeroconf;
  }

  /** Remove Zeroconf event handlers cleanly */
  private static removeZeroconfHandlers() {
    try {
      const zc = this.getZeroconf();
      if (this.zeroconfResolvedHandler) {
        zc.removeListener("resolved", this.zeroconfResolvedHandler);
        this.zeroconfResolvedHandler = null;
      }
      if (this.zeroconfErrorHandler) {
        zc.removeListener("error", this.zeroconfErrorHandler);
        this.zeroconfErrorHandler = null;
      }
    } catch {}
  }

  /** Parse Zeroconf TXT records (handles both array and object formats) */
  private static parseZeroconfTxt(txt: any): Record<string, string> {
    if (!txt) return {};
    if (Array.isArray(txt)) {
      const result: Record<string, string> = {};
      txt.forEach((item) => {
        if (typeof item === "string") {
          const [key, ...valParts] = item.split("=");
          if (key) result[key] = valParts.join("=");
        }
      });
      return result;
    }
    if (typeof txt === "object") return txt as Record<string, string>;
    return {};
  }
}
