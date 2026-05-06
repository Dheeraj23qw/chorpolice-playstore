# ADR-002: Redux as Single Source of Truth (SSOT)

## Context
Managing shared state across 4 devices where some devices (Clients) have zero authority.

## Decision
We use **Redux Toolkit** as the absolute Single Source of Truth (SSOT) for all multiplayer UI state.

## Rationale
1. **Consistency**: By forcing all network packets to update Redux, we ensure that the UI across all 4 devices remains synchronized. If a packet updates a role index, every device's Redux selector will reflect it simultaneously.
2. **Rehydration**: During reconnects, the Host sends a `SYNC_STATE` packet which is directly dispatched to Redux. This allows the client to "teleport" to the current game state without complex local logic.
3. **Debugging**: Redux DevTools (or logging the state) provides a clear timeline of every state transition, making it easy to identify where desyncs occurred.

## Consequences
- Requires strict adherence to the pattern: `Packet -> Handler -> Redux -> UI`.
- Prevents components from holding local state for game-critical data.
