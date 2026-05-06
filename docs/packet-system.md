# Packet System Reference

## 📜 Packet Structure
All packets are JSON objects with a mandatory `type` field.

```ts
{
  type: string;
  playerId?: string;
  // ... extra payload
}
```

## 📡 Essential Packets

### 1. `PUBLIC_REVEAL`
- **Sender**: Host
- **Purpose**: Triggers the 7-second cinematic reveal.
- **Payload**:
  - `kingIndex`, `policeIndex`: indices of public cards.
  - `players`: Array of player metadata for sync.

### 2. `ROLE_ASSIGN`
- **Sender**: Host
- **Purpose**: Private role delivery.
- **Payload**:
  - `playerId`: target player.
  - `role`: "King" | "Police" | "Thief" | "Advisor".

### 3. `ROUND_RESULT`
- **Sender**: Host
- **Purpose**: Finalizes investigation.
- **Payload**:
  - `correct`: boolean (if police caught thief).
  - `allRoles`: full reveal of everyone's positions.
  - `leaderboard`: current standings.

### 4. `SYNC_STATE`
- **Sender**: Host
- **Purpose**: Reconnect recovery.
- **Payload**: A full snapshot of `ChorPoliceEngine.state` and Redux `session` state.

### 5. `POLICE_GUESS`
- **Sender**: Police Player (via Client)
- **Purpose**: Submitting a suspect selection.
- **Authority**: Rejected if sender `myRole` is not `Police`.

### 6. `SCORE_GUESS`
- **Sender**: Any Player
- **Purpose**: Submitting a guess during the Quiz phase.
- **Authority**: Handled by Host to calculate bonus points.

## 🛡️ Validation Rules
1. **Host-Authority**: Only packets from the Host IP are accepted for state-altering transitions (`PUBLIC_REVEAL`, `ROUND_RESULT`).
2. **Phase Locking**: `POLICE_GUESS` is ignored if the phase is not `police_turn`.
3. **Idempotency**: Duplicate `GAME_END` packets are ignored to prevent double coin settlements.

---
[Gameplay Phases](./gameplay-phases.md) | [Economy System](./economy-system.md)
