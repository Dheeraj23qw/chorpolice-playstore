# Gameplay Phases

## 🔄 Lifecycle Table

| Phase | Internal Key | Duration | Authority | Interactions |
| :--- | :--- | :--- | :--- | :--- |
| **Dealing** | `dealing` | ~4.5s | Host | None (Locked) |
| **Private Reveal**| `private_reveal` | 2s | All | None (Locked) |
| **Police Turn** | `police_turn` | Indefinite | Police | Card Click |
| **Result Reveal** | `result` | 8.5s | Host | None (Locked) |
| **Score Quiz** | `score_quiz` | ~4s/player | All | Select Option |
| **Final Result** | `final_result` | Indefinite | All | Exit Button |

## 🎬 Cinematic Sequence (Chor Police)

### 1. `PUBLIC_4_CARD_REVOLVE` (0s - 4s)
- **Visual**: 4 cards rotate in a cinematic circle.
- **Privacy**: The `Thief` and `Advisor` cards **fade out** during the revolve to prevent tracking.
- **Sync**: Triggered by `PUBLIC_REVEAL` packet.

### 2. `PUBLIC_HOLD` (4s - 5s)
- **Visual**: The cards pause in their final positions.
- **Sync**: Local `setTimeout` on all devices.

### 3. `PRIVATE_ROLE_REVEAL` (5s - 7s)
- **Visual**: The local player's role is shown on their device HUD.
- **Phase**: `private_reveal`.
- **Constraint**: Other players' roles remain hidden.

### 4. `PUBLIC_INVESTIGATION` (7s+)
- **Visual**: The `King` and `Police` cards are removed from the board.
- **Interaction**: The `Police` player's device unlocks card interaction.
- **Phase**: `police_turn`.

### 5. `SCORE_QUIZ` (After Round 3)
- **Visual**: "Think & Count" quiz screen appears.
- **Logic**: Each player must guess their total points.
- **Bot Behavior**: Bots wait 3s before answering based on internal logic.

---
[Multiplayer Architecture](./multiplayer-architecture.md) | [Packet System](./packet-system.md)
