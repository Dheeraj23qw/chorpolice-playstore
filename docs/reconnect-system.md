# Reconnect & Recovery System

## 🕒 Recovery Timeline

1. **Detection (0s - 5s)**: Heartbeat missing for `RECONNECT_WINDOW`.
2. **Overlay (5s - 25s)**: UI shows "Reconnecting..." overlay. The player has 20s to restore their socket connection.
3. **Recovery (25s+)**: If unsuccessful, the Host replaces the missing human with an AI Bot (`ChorPoliceBotBehavior`).

## 🔑 Authentication
To prevent session hijacking during reconnects, the system validates:
- `sessionToken`: A unique UUID generated at lobby creation.
- `deviceId`: Hardened identifier to ensure the same physical device is rejoining.
- `roomCode`: Ensures the player is landing in the correct match.

## 🔄 State Synchronization (`SYNC_STATE`)
When a player re-establishes a TCP connection, the Host sends a `SYNC_STATE` packet.

### Sync Payload Includes:
- **Phase**: Current `gamePhase` (e.g., `police_turn`).
- **Board**: The `roles` array (preserving revealed positions).
- **Scores**: Authoritative round scores from the engine.
- **Roles**: The reconnected player's specific role index.

## 🛡️ Stale Packet Rejection
After a reconnect, the client might receive "echo" packets from the previous socket buffer.
- **Guard**: The `PacketRouter` checks against current `gamePhaseRef`.
- **Example**: If the reconnected client receives an old `ROLE_ASSIGN` while the game is already in `result` phase, the packet is silently dropped.

---
[Economy System](./economy-system.md) | [Timers & Cleanup](./timers-and-cleanup.md)
