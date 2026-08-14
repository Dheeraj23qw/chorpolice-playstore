# LAN Multiplayer Backend & Networking Architecture

## Executive Overview

The Chor Police LAN Multiplayer backend is a custom, zero-dependency, peer-to-peer TCP networking system built specifically for Expo / React Native using `react-native-tcp-socket`. It enables local Wi-Fi / Hotspot multiplayer without requiring an external cloud server.

---

## 1. Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                   Redux State (sessionSlice)                    │
└───────────────────────────────▲─────────────────────────────────┘
                                │ (dispatches state updates)
┌───────────────────────────────┴─────────────────────────────────┐
│                     lanLobbyCoordinator                         │
│     High-level orchestrator: Host init, Join, Stop, Re-join    │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────────┐      ┌──────────────────────────────┐
│     LobbyPacketHandler       │      │      HostIpDetector          │
│ Packet decoding, join validation,    │ Asynchronous local IPv4      │
│ version enforcement, routing │      │ network interface detection  │
└──────────────┬───────────────┘      └──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GameSessionTransport                        │
│ Low-level TCP manager: Port rotation, safeSend(), socket map    │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────────┐      ┌──────────────────────────────┐
│         TcpFraming           │      │       HeartbeatService       │
│ Length-prefixed binary       │      │ PING / PONG keep-alive loop  │
│ [4B length][JSON payload]    │      │ & connection health tracking │
└──────────────────────────────┘      └──────────────────────────────┘
```

---

## 2. Low-Level TCP Packet Framing (`TcpFraming.ts`)

TCP is a stream-based protocol, meaning packet boundaries are not guaranteed. To prevent packet fragmentation or concatenation bugs:

1. **Header**: 4 bytes (Big-Endian UInt32) representing the length `N` of the JSON payload.
2. **Payload**: `N` bytes of UTF-8 encoded JSON envelope.

```
┌─────────────────────────┬────────────────────────────────────────┐
│  Payload Length (4B)    │           JSON Envelope (N Bytes)      │
│  UInt32BE (e.g. 0x0080) │ {"version":"1.0","packet":{...}}       │
└─────────────────────────┴────────────────────────────────────────┘
```

### Safety Features
- **1 MB Max Frame Boundary Guard**: Frames > 1,048,576 bytes are immediately rejected to prevent buffer overflow attacks.
- **Buffer Retention**: Incomplete frame bytes remain in a per-socket `clientBuffers` map until the rest of the frame arrives.

---

## 3. Host Initialization & Join Handshake Flow

### Host Creation Sequence (`hostLanLobby`)
1. **Port Rotation**: Attempts binding to primary port `41235`. If occupied, rotates to `41236..41240` or OS dynamic port (`0`).
2. **IP Detection**: `startIpDetectionLoop` finds active Wi-Fi / Hotspot IPv4 address.
3. **QR Generation**: Produces JSON payload string:
   ```json
   {
     "host": "192.168.1.10",
     "port": 41235,
     "version": "1.0",
     "sessionId": "host_player_123"
   }
   ```

### Guest Join Sequence (`joinLanLobby`)
1. **QR Scanning**: Decodes JSON payload from host.
2. **IP Validation**: Verifies `isValidIpv4(host)`.
3. **Socket Probe (`probeAsync`)**: Sends a temporary `PING` probe (800ms timeout) to verify the host is listening before committing.
4. **`PLAYER_JOIN` Packet**: Client sends join payload:
   ```json
   {
     "type": "PLAYER_JOIN",
     "roomCode": "123",
     "appVersion": "7.0.0",
     "player": {
       "id": "guest_abc",
       "name": "Alex",
       "avatarId": 2,
       "coins": 500
     }
   }
   ```
5. **Host Validation**:
   - Check room code match.
   - Check game state is `idle` (not in progress).
   - Check room capacity (< 4 players).
   - Check `appVersion` compatibility (`isNewerVersion`).
6. **Acceptance**: Host adds player to room list, dispatches Redux state, and broadcasts updated `PLAYER_LIST_UPDATE` to all connected clients.

---

## 4. Self-Healing & Resilience Mechanisms

### 1. Safe Socket Writes (`safeSend`)
Prevents crash-on-destroyed-socket errors by verifying 3 guards before calling `socket.write`:
- Session ID match (`sid === currentSessionId`).
- Not in closing state (`!isClosing`).
- Socket is active (`!socket.destroyed` and `!__explicitlyDestroyed`).

### 2. Periodic Authoritative Sync (Host Heartbeat)
Every 3 seconds, the host broadcasts the complete, authoritative `PLAYER_LIST_UPDATE` packet. If a client missed a packet over Wi-Fi, it automatically self-heals back into sync within 3 seconds.

### 3. Graceful Teardown (`stopCoordinator`)
Kills `HeartbeatService` *before* destroying socket transport to avoid race-condition write attempts on closed sockets.

---

## 5. Security & Untrusted Input Protection

| Threat | Mitigation |
|--------|------------|
| Malformed IP payload | `isValidIpv4` check before network connection |
| Giant TCP packet / OOM | `extractFrames` drops frames > 1 MB |
| Outdated client protocol | Host checks `appVersion` and returns `UPDATE_REQUIRED` |
| Malformed JSON/player names | `sanitizeJoiningPlayer` sanitizes names, IDs, and coin values |
| Late joins during active match | Host rejects join with `PLAYER_JOIN_REJECT` ("game_in_progress") |
