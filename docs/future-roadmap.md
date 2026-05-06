# Future Roadmap

## 🚀 Near-Term Improvements

### 1. Lag Compensation
- **Current**: Direct reliance on network packets.
- **Future**: Client-side prediction for card clicks to make the UI feel instantaneous regardless of ping.

### 2. Spectator Mode
- **Goal**: Allow more than 4 players to join the lobby as observers.
- **Implementation**: Syncing `PUBLIC_REVEAL` to observers but omitting `ROLE_ASSIGN`.

## 📈 Long-Term Vision

### 1. Cloud Synchronization
- **Goal**: Cross-match persistence for player levels and coin balances.
- **Tech**: Integration with a central backend (Firebase/Node.js) for persistent player profiles.

### 2. Automated Multiplayer Testing
- **Goal**: Headless bot matches to detect desyncs automatically.
- **Tech**: Running multiple engine instances in a CI/CD pipeline to simulate thousands of random games.

### 3. Matchmaking
- **Goal**: Online lobby system.
- **Tech**: Transitioning from LAN-only to a Relay-based server architecture to support non-local play.

### 4. Anti-Cheat
- **Goal**: Prevent tampered clients from sending illegal `POLICE_GUESS` packets.
- **Tech**: Verification of player role on the Host before accepting any guess payload.

---
[Debugging Guide](./debugging-guide.md) | [Decision Records](./decision-records/README.md)
