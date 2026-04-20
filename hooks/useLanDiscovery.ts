import { useEffect, useRef, useState } from "react";
import { getIpAddress } from "react-native-device-info";

import { updateDebugMetric } from "@/service/observability/DebugService";
import {
  ZeroconfDiscoveryService,
  DiscoveredHost,
} from "@/service/network/ZeroconfDiscoveryService";

const UNKNOWN_IP = "unknown";

const normalizeIp = (value?: string | null) => {
  if (!value || value === "0.0.0.0" || value === "::1") {
    return UNKNOWN_IP;
  }
  return value;
};

/**
 * useLanDiscovery — Zeroconf-based LAN discovery.
 *
 * HOST: Publishes a `_chorpolice-game._tcp` mDNS service with lobby metadata.
 * CLIENT: Scans for services and returns discovered hosts.
 *
 * Replaces the old UDP broadcast approach for 100% discovery on Android 12+.
 */
export const useLanDiscovery = (
  isHost: boolean,
  deviceName: string,
  enabled = true,
) => {
  const [availableHosts, setAvailableHosts] = useState<DiscoveredHost[]>([]);
  const [localIp, setLocalIp] = useState<string>(UNKNOWN_IP);
  const deviceNameRef = useRef(deviceName);
  const localIpRef = useRef<string>(UNKNOWN_IP);

  useEffect(() => {
    deviceNameRef.current = deviceName;
  }, [deviceName]);

  // ── Resolve local IP ──
  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const ip = normalizeIp(await getIpAddress());
        if (!active) return;

        localIpRef.current = ip;
        setLocalIp(ip);
        updateDebugMetric("localIp", ip);

        if (__DEV__) {
          console.log(`[LAN] Local IP resolved: ${ip}`);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("[LAN] Failed to resolve local IP", error);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    updateDebugMetric("discoveredHostCount", availableHosts.length);
  }, [availableHosts.length]);

  // ── Zeroconf Discovery ──
  useEffect(() => {
    if (!enabled) {
      setAvailableHosts([]);
      updateDebugMetric("discoveredHostCount", 0);
      ZeroconfDiscoveryService.stopScan();
      ZeroconfDiscoveryService.unpublishService();
      return;
    }

    if (isHost) {
      // HOST: Publish the Zeroconf service
      ZeroconfDiscoveryService.publishService({
        lobbyName: deviceNameRef.current,
        playerCount: 1,
        hostPlayerId: "host_id",
      });

      if (__DEV__) {
        console.log(
          `[LAN] Host publishing Zeroconf service as "${deviceNameRef.current}"`,
        );
      }

      return () => {
        ZeroconfDiscoveryService.unpublishService();
      };
    }

    // CLIENT: Scan for Zeroconf services
    ZeroconfDiscoveryService.startScan();

    const unsubscribe = ZeroconfDiscoveryService.subscribe((hosts) => {
      setAvailableHosts(hosts);
    });

    // Prune stale hosts every 6 seconds
    const pruneInterval = setInterval(() => {
      const now = Date.now();
      const currentHosts = ZeroconfDiscoveryService.getHosts();
      const freshHosts = currentHosts.filter(
        (host) => now - host.lastSeen < 15000,
      );

      if (freshHosts.length !== currentHosts.length) {
        setAvailableHosts(freshHosts);
      }
    }, 6000);

    return () => {
      unsubscribe();
      clearInterval(pruneInterval);
      ZeroconfDiscoveryService.stopScan();
    };
  }, [enabled, isHost]);

  return { availableHosts, localIp };
};
