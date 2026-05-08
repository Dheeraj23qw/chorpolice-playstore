import { useEffect, useRef, useState, useCallback } from "react";
import { DiscoveryResult } from "@/service/network/LanDiscoveryStrategy";
import { startLanDiscovery, stopLanDiscovery } from "@/service/lanLobbyCoordinator";

/**
 * useLanDiscovery — React hook for automatic LAN room discovery.
 *
 * ARCHITECTURE:
 * - Only active when `enabled=true` (JoinScreen).
 * - Merges and deduplicates rooms from multiple sources (UDP, NSD, QR).
 * - Evicts stale rooms not seen in >10s (generous window for dropped packets).
 * - Uses stable refs so the UDP socket is never torn down on re-render.
 * - Discovery failure is silent — QR and Room Code join always work.
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
      lastSeenAt: now,
      sources: result.sources || [result.source],
    };

    setDiscoveredRooms((prev) => {
      // 1. Find existing room by priority: lobbyId → roomCode → ip+port
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

        // Update existing room with new info, keep richer metadata if incoming is missing
        const updatedRoom: DiscoveryResult = {
          ...existingRoom,
          ...newRoom,
          hostName: newRoom.hostName || existingRoom.hostName,
          lobbyId: newRoom.lobbyId || existingRoom.lobbyId,
          roomCode: newRoom.roomCode || existingRoom.roomCode,
          playerCount: newRoom.playerCount ?? existingRoom.playerCount,
          maxPlayers: newRoom.maxPlayers ?? existingRoom.maxPlayers,
          protocolVersion: newRoom.protocolVersion || existingRoom.protocolVersion,
          lastSeenAt: now,
          sources: mergedSources,
          source: newRoom.source,
        };

        const updatedRooms = [...prev];
        updatedRooms[existingIndex] = updatedRoom;
        return updatedRooms;
      }

      // Cap at 10 rooms to prevent memory bloat from rogue networks
      if (prev.length >= 10) return prev;
      return [...prev, newRoom];
    });
  }, []);

  // ── Start/stop discovery lifecycle ──
  useEffect(() => {
    if (!enabled) {
      stopLanDiscovery();
      setIsSearching(false);
      setDiscoveredRooms([]);
      return;
    }

    console.log("[useLanDiscovery] Starting discovery listener...");
    setDiscoveredRooms([]);
    setIsSearching(true);

    // Use a stable wrapper so the socket callback never stales
    startLanDiscovery((result) => onDiscoveryRef.current(result));

    return () => {
      console.log("[useLanDiscovery] Cleaning up discovery listener.");
      stopLanDiscovery();
      setIsSearching(false);
    };
  }, [enabled]); // ← only re-run when enabled flips, not on every render

  // ── Stale data cleanup ──
  // Remove rooms not seen in >10 seconds (generous: 2s broadcast * 5 missed packets)
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setDiscoveredRooms((prev) => {
        const next = prev.filter((r) => now - (r.lastSeenAt || 0) < 15000); // 15s TTL
        return next.length !== prev.length ? next : prev;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [enabled]);

  return {
    discoveredRooms,
    isSearching,
    clearRooms: useCallback(() => setDiscoveredRooms([]), []),
  };
};
