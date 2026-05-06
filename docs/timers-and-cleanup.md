# Timers & Cleanup Strategy

## ⏳ Active Timers

| Category | Typical Duration | Logic Handler | Purpose |
| :--- | :--- | :--- | :--- |
| **Reveal Spin** | 4,000ms | `useCPRevealSequence` | Sync public card animations. |
| **Private Reveal**| 2,000ms | `useCPRevealSequence` | Show hidden role HUD. |
| **Bot Thinking** | 3,000ms | `ChorPoliceBotBehavior`| Humanize AI guess delay. |
| **Heartbeat** | 2,000ms | `HeartbeatService` | Connection monitoring. |
| **Round Reset** | 8,500ms | `policeHandlers` | Auto-transition to next round. |

## 🛡️ Cleanup Strategy
To prevent memory leaks and "Ghost Transitions" (where a timer from a previous game triggers in a new one), the project enforces a strict cleanup policy.

### 1. `timerRefs` Pattern
In `useChorPoliceMultiplayer`, all `setTimeout` calls must be pushed to a `timerRefs` array.
```ts
const timer = setTimeout(() => { ... }, 1000);
timerRefs.current.push(timer);
```
On **unmount** or **phase reset**, `cleanup.clearAllTimers()` iterates and clears them.

### 2. Timer Safety Guards
Before starting a long cinematic sequence (like the reveal), handlers must call:
```ts
refs.timerRefs.current.forEach(clearTimeout);
refs.timerRefs.current = [];
```
This ensures that re-delivered packets or rapid reconnects do not schedule overlapping sequences.

### 3. Listener Cleanup
The `subscribeToPackets` utility in `lanGameService.ts` returns an `unsubscribe` function. This is strictly called in the `useEffect` cleanup to prevent duplicate packet processing.

---
[Reconnect System](./reconnect-system.md) | [Folder Architecture](./folder-architecture.md)
