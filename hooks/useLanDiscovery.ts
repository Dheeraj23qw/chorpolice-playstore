import { useEffect, useRef, useState } from "react";
import dgram from "react-native-udp";
import { getIpAddress } from "react-native-device-info";

import { NETWORK } from "../constants/Networking";
import { updateDebugMetric } from "@/service/observability/DebugService";

type Host = {
  deviceName: string;
  ip: string;
  lastSeen: number;
  version: string;
};

const UNKNOWN_IP = "unknown";

const normalizeIp = (value?: string | null) => {
  if (!value || value === "0.0.0.0" || value === "::1") {
    return UNKNOWN_IP;
  }

  return value;
};

const getBroadcastTargets = (localIp: string) => {
  const targets = new Set<string>([NETWORK.BROADCAST_ADDRESS]);
  const octets = localIp.split(".");

  if (octets.length === 4 && octets[0] !== "127" && localIp !== UNKNOWN_IP) {
    targets.add(`${octets[0]}.${octets[1]}.${octets[2]}.255`);
  }

  return Array.from(targets);
};

export const useLanDiscovery = (isHost: boolean, deviceName: string) => {
  const [availableHosts, setAvailableHosts] = useState<Host[]>([]);
  const [localIp, setLocalIp] = useState<string>(UNKNOWN_IP);
  const deviceNameRef = useRef(deviceName);
  const localIpRef = useRef<string>(UNKNOWN_IP);
  const broadcastTargetsRef = useRef<string[]>([NETWORK.BROADCAST_ADDRESS]);

  useEffect(() => {
    deviceNameRef.current = deviceName;
  }, [deviceName]);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const ip = normalizeIp(await getIpAddress());
        if (!active) {
          return;
        }

        localIpRef.current = ip;
        setLocalIp(ip);
        broadcastTargetsRef.current = getBroadcastTargets(ip);
        updateDebugMetric("localIp", ip);

        if (__DEV__) {
          console.log(
            `[LAN] Local IP resolved: ${ip}. Discovery targets: ${broadcastTargetsRef.current.join(", ")}`,
          );
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

  useEffect(() => {
    let active = true;

    const socket = dgram.createSocket({
      type: "udp4",
      reusePort: true,
      debug: __DEV__,
    }) as any;

    socket.on("listening", () => {
      if (!active) return;

      try {
        socket.setBroadcast(true);
        const address = socket.address?.();
        if (__DEV__) {
          console.log(
            `[LAN] Discovery socket ready as ${isHost ? "HOST" : "CLIENT"} on ${address?.address ?? "0.0.0.0"}:${address?.port ?? NETWORK.DISCOVERY_PORT}`,
          );
        }
      } catch (error) {
        console.error("[LAN] Broadcast error", error);
      }
    });

    socket.on("error", (error: any) => {
      if (!error?.message?.includes("closed")) {
        console.error("[LAN] Discovery socket error", error);
      }
    });

    socket.on("message", (msg: any, rinfo: any) => {
      if (!active || isHost) return;

      try {
        const data = JSON.parse(msg.toString());

        if (
          data.type === NETWORK.DISCOVERY_MSG &&
          data.version === NETWORK.PROTOCOL_VERSION
        ) {
          const now = Date.now();

          if (__DEV__) {
            console.log(
              `[LAN] Host discovered: ${data.deviceName} @ ${rinfo.address} (local ${localIpRef.current})`,
            );
          }

          setAvailableHosts((prev) => {
            const index = prev.findIndex((host) => host.ip === rinfo.address);

            if (index !== -1) {
              const updated = [...prev];
              updated[index] = {
                ...data,
                ip: rinfo.address,
                lastSeen: now,
              };
              return updated;
            }

            return [...prev, { ...data, ip: rinfo.address, lastSeen: now }];
          });
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("[LAN] Discovery parse error", error);
        }
      }
    });

    try {
      socket.bind(NETWORK.DISCOVERY_PORT);
    } catch (error) {
      console.error("[LAN] Failed to bind discovery socket", error);
    }

    if (isHost) {
      const interval = setInterval(() => {
        if (!active) return;

        const message = JSON.stringify({
          type: NETWORK.DISCOVERY_MSG,
          deviceName: deviceNameRef.current,
          version: NETWORK.PROTOCOL_VERSION,
        });

        for (const target of broadcastTargetsRef.current) {
          try {
            socket.send(
              message,
              0,
              message.length,
              NETWORK.DISCOVERY_PORT,
              target,
            );

            if (__DEV__) {
              console.log(
                `[LAN] Discovery broadcast sent to ${target}:${NETWORK.DISCOVERY_PORT} from ${localIpRef.current}`,
              );
            }
          } catch (error) {
            if (__DEV__) {
              console.warn(
                `[LAN] Failed to broadcast discovery packet to ${target}`,
                error,
              );
            }
          }
        }
      }, 2000);

      return () => {
        active = false;
        clearInterval(interval);
        socket.close();
      };
    }

    const prune = setInterval(() => {
      if (!active) return;

      const now = Date.now();
      setAvailableHosts((prev) =>
        prev.filter((host) => now - host.lastSeen < 6000),
      );
    }, 3000);

    return () => {
      active = false;
      clearInterval(prune);
      socket.close();
    };
  }, [isHost]);

  return { availableHosts, localIp };
};
