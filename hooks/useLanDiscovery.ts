/**
 * --- LAN DISCOVERY HOOK ---
 * WHY: This hook handles the UDP broadcast layer. It ensures that devices
 * find each other automatically without needing a server.
 * * DEBUG MODE: Uses __DEV__ to log network activity only during development.
 */

import React, { useState, useEffect } from "react";
import dgram from "react-native-udp";
import { NETWORK } from "../constants/Networking";

export const useLanDiscovery = (isHost: boolean, deviceName: string) => {
  const [availableHosts, setAvailableHosts] = useState<any[]>([]);
  const deviceNameRef = React.useRef(deviceName);

  // Sync ref with live state without triggering effect re-run
  React.useEffect(() => {
    deviceNameRef.current = deviceName;
  }, [deviceName]);

  useEffect(() => {
    let isEffectActive = true;
    const socket = dgram.createSocket({ type: "udp4" });
    
    socket.once("listening", () => {
      if (!isEffectActive) return; // Prevent ops on cleanup
      try {
        socket.setBroadcast(true);
        if (__DEV__) {
          console.debug(`[LAN-DISCOVERY] Socket listening on port ${NETWORK.DISCOVERY_PORT}`);
        }
      } catch (err) {
        console.error("[LAN-DISCOVERY] Failed to set broadcast:", err);
      }
    });

    socket.on("error", (err) => {
      // Only log if not a "Socket is closed" error during cleanup
      if (err.message?.includes("closed")) return;
      console.error("[LAN-DISCOVERY] UDP Socket Error:", err);
    });

    socket.bind(NETWORK.DISCOVERY_PORT);

    if (isHost) {
      // HOST LOGIC: Repeatedly shout "I am here" to the network
      const interval = setInterval(() => {
        if (!isEffectActive) return;

        const message = JSON.stringify({
          type: NETWORK.DISCOVERY_MSG,
          deviceName: deviceNameRef.current, // Use Ref to get latest name without re-mounting
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
        } catch (e) {
          // Ignore send errors on unmount
        }
      }, 2000);

      return () => {
        isEffectActive = false;
        clearInterval(interval);
        try { socket.close(); } catch(e) {}
      };
    } else {
      // ... same client logic ...
      (socket as any).on("message", (msg: any, rinfo: any) => {
        if (!isEffectActive) return;
        try {
          const data = JSON.parse(msg.toString());
          const isCompatible =
            data.type === NETWORK.DISCOVERY_MSG &&
            data.version === NETWORK.PROTOCOL_VERSION;

          if (isCompatible) {
            setAvailableHosts((prev) => {
              const now = Date.now();
              const existingIndex = prev.findIndex((h) => h.ip === rinfo.address);
              if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = { ...data, ip: rinfo.address, lastSeen: now };
                return updated;
              }
              return [...prev, { ...data, ip: rinfo.address, lastSeen: now }];
            });
          }
        } catch (e) {}
      });

      const pruneInterval = setInterval(() => {
        if (!isEffectActive) return;
        const now = Date.now();
        setAvailableHosts((prev) => prev.filter((h) => now - h.lastSeen < 6000));
      }, 3000);

      return () => {
        isEffectActive = false;
        clearInterval(pruneInterval);
        try { socket.close(); } catch(e) {}
      };
    }
  }, [isHost]); // Removed deviceName from deps

  return { availableHosts };
};
