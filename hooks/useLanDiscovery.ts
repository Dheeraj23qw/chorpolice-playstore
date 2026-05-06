import { useEffect, useRef, useState, useCallback } from "react";
import { DiscoveryResult } from "@/service/network/LanDiscoveryStrategy";
import { startLanDiscovery, stopLanDiscovery } from "@/service/lanLobbyCoordinator";

/**
 * Bug 2 fix: Listener only starts when `enabled=true`.
 *   - On JoinScreen: enabled=true (joiner listens for rooms)
 *   - On LobbySetupScreen: do NOT pass this hook at all, or pass enabled=false
 *     so the listener doesn't conflict with the host broadcaster on the same port.
 *
 * Bug 3 fix: Use a stable ref for the callback so the useEffect dependency
 *   never changes after mount. This prevents the socket from being torn down
 *   and recreated on every render.
 */
export const useLanDiscovery = (enabled: boolean = false) => {
  const [discoveredRooms, setDiscoveredRooms] = useState<DiscoveryResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Stable ref so the useEffect below never re-runs because of callback identity
  const onDiscoveryRef = useRef<(result: DiscoveryResult) => void>(() => {});

  onDiscoveryRef.current = useCallback((result: DiscoveryResult) => {
    const now = Date.now();
    const newRoom: DiscoveryResult = {
      ...result,
      lastSeenAt: result.lastSeenAt || now,
      sources: result.sources || [result.source],
    };

    setDiscoveredRooms((prev) => {
      // 1. Find existing room by priority: lobbyId -> roomCode -> ip+port
      const existingIndex = prev.findIndex(
        (room) =>
          (newRoom.lobbyId && room.lobbyId === newRoom.lobbyId) ||
          (newRoom.roomCode && room.roomCode === newRoom.roomCode) ||
          (room.ip === newRoom.ip && room.port === newRoom.port)
      );

      if (existingIndex !== -1) {
        const existingRoom = prev[existingIndex];
        
        // Merge sources array uniquely
        const mergedSources = Array.from(
          new Set([...(existingRoom.sources || [existingRoom.source]), newRoom.source])
        );

        if (!existingRoom.sources?.includes(newRoom.source)) {
           console.log(`[useLanDiscovery] Merged duplicate room ${existingRoom.lobbyId} (sources: ${mergedSources.join(", ")})`);
        }

        // Update existing room with new info, but keep richer metadata if incoming is missing it
        const updatedRoom: DiscoveryResult = {
          ...existingRoom,
          ...newRoom,
          // Keep old values if new values are undefined
          hostName: newRoom.hostName || existingRoom.hostName,
          lobbyId: newRoom.lobbyId || existingRoom.lobbyId,
          roomCode: newRoom.roomCode || existingRoom.roomCode,
          playerCount: newRoom.playerCount ?? existingRoom.playerCount,
          maxPlayers: newRoom.maxPlayers ?? existingRoom.maxPlayers,
          protocolVersion: newRoom.protocolVersion || existingRoom.protocolVersion,
          lastSeenAt: now,
          sources: mergedSources,
          source: newRoom.source, // update to latest active source
        };

        const updatedRooms = [...prev];
        updatedRooms[existingIndex] = updatedRoom;
        return updatedRooms;
      }

      return [...prev, newRoom];
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopLanDiscovery();
      setIsSearching(false);
      setDiscoveredRooms([]);
      return;
    }

    console.log("[useLanDiscovery] Starting UDP listener...");
    setDiscoveredRooms([]);
    setIsSearching(true);

    // Use a stable wrapper so the socket callback never stales
    startLanDiscovery((result) => onDiscoveryRef.current(result));

    return () => {
      console.log("[useLanDiscovery] Cleaning up UDP listener.");
      stopLanDiscovery();
      setIsSearching(false);
    };
  }, [enabled]); // ← only re-run when enabled flips, not on every render

  // 🧹 STALE DATA CLEANUP: Remove rooms not seen in > 7 seconds
  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      setDiscoveredRooms((prev) => {
        const next = prev.filter((r) => now - (r.lastSeenAt || 0) < 7000);
        return next.length !== prev.length ? next : prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [enabled]);

  return {
    discoveredRooms,
    isSearching,
    clearRooms: () => setDiscoveredRooms([]),
  };
};
