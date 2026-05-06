# Folder Architecture & Responsibilities

## 📂 Directory Map

### `hooks/chorPoliceMultiplayer/`
- **Purpose**: Business logic for the game mode.
- **`useChorPoliceMultiplayer.ts`**: The main orchestrator hook.
- **`handlers/`**: Packet-specific side effects (Reveal, Police, Quiz, etc.).
- **`useCPEconomy.ts`**: Coin debit/settlement logic.

### `service/`
- **Purpose**: Long-lived services and engines.
- **`ChorPoliceEngine.ts`**: Authoritative game rules (Roles, Scores).
- **`lanGameService.ts`**: Network API layer (Send, Broadcast, Subscribe).
- **`network/`**: Low-level TCP transport (`GameSessionTransport`).

### `redux/`
- **Purpose**: Global state (SSOT).
- **`reducers/sessionSlice.ts`**: Game phases, roles, and economy status.
- **`selectors/`**: Memoized state lookups used by hooks.

### `screens/ChorPoliceMultiplayer/`
- **Purpose**: View layer.
- **`GamePlaySection.tsx`**: Renders cards and suspect reveal animations.
- **`HeaderSection.tsx`**: Renders round counts and scores.

### `components/RajamantriGameScreen/`
- **Purpose**: Shared UI components.
- **`playButton.tsx`**: Role-aware action button (personalized subtext).
- **`ExitModal.tsx`**: Fairness-aware exit confirmation.

### `audio/`
- **`audioEngine.ts`**: Multi-layered sound triggering.

## 🏗️ Dependency Flow
1. **Packet** arrives via `GameSessionTransport`.
2. Routed to `ChorPoliceEngine` (Update Logic) and `PacketRouter`.
3. `PacketRouter` triggers **Handlers** in the hook.
4. **Handlers** update **Redux** and local **Animations**.
5. **UI** re-renders based on Redux SSOT.

---
[Timers & Cleanup](./timers-and-cleanup.md) | [Debugging Guide](./debugging-guide.md)
