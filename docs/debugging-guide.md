# Debugging & Troubleshooting Guide

## 🔍 Common Issues

### 1. Game State Desync
- **Symptoms**: Host is in `police_turn` but Client is stuck in `dealing`.
- **Cause**: Missed `PUBLIC_REVEAL` packet or crash in the reveal animation.
- **Debug**: Check the logs for `🎭 [CPPacket] PUBLIC_REVEAL received`. If present, check for `JS Error` in the animation logic.
- **Fix**: Reconnect to trigger a `SYNC_STATE`.

### 2. Double Coin Debit
- **Symptoms**: Player loses double the stake.
- **Check**: `sessionSlice.economy.matchId`. If the `matchId` didn't update between games, the debit flag won't reset.
- **Logs**: `💰 [ECONOMY] Debiting stake for match...`

### 3. Ghost card flips
- **Symptoms**: Cards flip or move unexpectedly.
- **Cause**: Overlapping timers from previous rounds.
- **Check**: `timerRefs.current` cleanup in `useCPCleanup.ts`.

## 📝 Logging Strategy
The project uses prefix-based logging for easy filtering in Logcat/Flipper:
- `🎭 [CPHook]`: Orchestrator state changes.
- `🎭 [CPEngine]`: Authoritative rule updates.
- `📡 [LAN]`: Socket connections and heartbeats.
- `💰 [ECONOMY]`: Financial transactions.

## 🧪 Production Stress Test Checklist
- [ ] **Rapid Start**: Clicking "Play" repeatedly before the shuffle finishes.
- [ ] **Middle-Exit**: Closing the app during the `private_reveal` phase.
- [ ] **Hotspot Toggle**: Disabling Wi-Fi mid-game.
- [ ] **Bot Handoff**: Disconnecting a player and verifying the bot takes over after 20s.
- [ ] **Tie Game**: Checking if the economy splits the pot for a tie.

---
[Folder Architecture](./folder-architecture.md) | [Future Roadmap](./future-roadmap.md)
