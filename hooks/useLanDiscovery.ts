import { useState, useEffect, useRef } from "react";
import dgram from "react-native-udp";
import { NETWORK } from "../constants/Networking";

type Host = {
  deviceName: string;
  ip: string;
  lastSeen: number;
  version: string;
};

export const useLanDiscovery = (isHost: boolean, deviceName: string) => {
  const [availableHosts, setAvailableHosts] = useState<Host[]>([]);
  const deviceNameRef = useRef(deviceName);

  // keep latest device name
  useEffect(() => {
    deviceNameRef.current = deviceName;
  }, [deviceName]);

  useEffect(() => {
    let active = true;

    // ✅ create socket ONCE inside effect
    const socket = dgram.createSocket({ type: "udp4" }) as any;

    socket.on("listening", () => {
      if (!active) return;

      try {
        socket.setBroadcast(true);
        if (__DEV__) {
          console.log("[LAN] Listening...");
        }
      } catch (e) {
        console.error("[LAN] Broadcast error", e);
      }
    });

    socket.on("error", (err: any) => {
      if (!err?.message?.includes("closed")) {
        console.error("[LAN ERROR]", err);
      }
    });

    socket.bind(NETWORK.DISCOVERY_PORT);

    // =========================
    // 🟢 HOST MODE (broadcast)
    // =========================
    if (isHost) {
      const interval = setInterval(() => {
        if (!active) return;

        const message = JSON.stringify({
          type: NETWORK.DISCOVERY_MSG,
          deviceName: deviceNameRef.current,
          version: NETWORK.PROTOCOL_VERSION,
        });

        try {
          socket.send(
            message,
            0,
            message.length,
            NETWORK.DISCOVERY_PORT,
            NETWORK.BROADCAST_ADDRESS,
          );
        } catch {}
      }, 2000);

      return () => {
        active = false;
        clearInterval(interval);
        socket.close();
      };
    }

    // =========================
    // 🔵 CLIENT MODE (listen)
    // =========================
    socket.on("message", (msg: any, rinfo: any) => {
      if (!active) return;

      try {
        const data = JSON.parse(msg.toString());

        if (
          data.type === NETWORK.DISCOVERY_MSG &&
          data.version === NETWORK.PROTOCOL_VERSION
        ) {
          const now = Date.now();

          setAvailableHosts((prev) => {
            const index = prev.findIndex((h) => h.ip === rinfo.address);

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
      } catch (e) {
        if (__DEV__) console.warn("Parse error", e);
      }
    });

    // cleanup old hosts
    const prune = setInterval(() => {
      if (!active) return;

      const now = Date.now();
      setAvailableHosts((prev) => prev.filter((h) => now - h.lastSeen < 6000));
    }, 3000);

    return () => {
      active = false;
      clearInterval(prune);
      socket.close();
    };
  }, [isHost]);

  return { availableHosts };
};
