# Chor Police: Project Challenges & Solutions Log

This document tracks the major technical hurdles, recurring problems, and the solutions implemented throughout the development of Chor Police. It serves as a reference to understand past struggles and the strategies used to overcome them.

## 1. Hotspot & LAN Multiplayer Connectivity Stability
**The Problem:** 
Establishing a robust multiplayer connection over mobile hotspots was consistently problematic. Devices acting as hotspots had unpredictable IP address behaviors (differences between Android and iOS, cellular NAT issues). Additionally, mobile Wi-Fi environments are prone to transient network spikes and "flickers," which would frequently cause false-positive session timeouts and disconnect players mid-game.

**The Approach & Solution:**
- **Diagnostic Visibility:** We implemented comprehensive diagnostic logging across the entire network stack to visualize connection permutations and pinpoint where the drops were occurring.
- **Hardened IP Detection:** We refined the IP detection logic with specific fallbacks for Android hotspots and relaxed the strict `NetInfo` constraints that were blocking valid connections.
- **Tolerance for Instability:** We increased connection timeout thresholds to 15 seconds to ride out temporary network spikes.
- **Intelligent Keep-Alive:** Packet listeners were refactored to reset connection timers on *all* incoming traffic. We shifted the responsibility of peer eviction entirely to a dedicated `HeartbeatService`, allowing the transport layer to ignore temporary socket flickers.

## 2. Game State Desynchronization & Stale Data
**The Problem:** 
Keeping the game state perfectly synced across the host and multiple clients was a major pain point. We encountered "stale roles" bugs where previous round data leaked into new rounds. UI elements (like connection status) often relied on outdated closures, and lobby configurations (like the number of rounds) wouldn't properly update on client devices.

**The Approach & Solution:**
- **Enforced Clean Slates:** We mandated a strict reset of critical data arrays (like the roles array) at every round transition to prevent data leakage.
- **Ref-Based Tracking:** To combat React state closures in network callbacks, we transitioned to using `ref`-based tracking for real-time connection telemetry, ensuring the UI always read the absolute latest state.
- **Global Synchronization:** We built a dedicated synchronization mechanism that broadcasts the host's game configuration choices, updating the Redux state globally across all connected clients.

## 3. Lobby Flow, Bot Management & Onboarding Friction
**The Problem:**
The initial entry into the game was clunky. The "Let's Get Started" button froze during heavy asset preloading. The app boot sequence had redundant loading screens. In the lobby, generating bots led to naming/avatar conflicts, and relying heavily on QR scanning proved unstable compared to manual entry.

**The Approach & Solution:**
- **Debounced Interactions & Feedback:** We added visual loading states and click-debouncing to the onboarding button to prevent users from spamming clicks while the app was busy.
- **Boot Optimization:** We stabilized the app boot sequence by removing redundant loading screens and optimizing asset preloading.
- **Conflict-Free Bots:** We overhauled the lobby initialization to ensure bot names and avatars are uniquely generated and conflict-free when joining.
- **Join Flow Prioritization:** We shifted the multiplayer join flow to prioritize reliable manual room code entry over QR scanning, while also patching scanner stability issues.

## 4. UI/UX Polishing & Momentum
**The Problem:** 
Game transitions felt slow due to bloated timers and redundant cinematic effects (like excessive shine animations). The lobby UI was confusing for non-hosts, who couldn't easily see game settings while trying to customize their profiles. The leaderboard lacked a modern feel.

**The Approach & Solution:**
- **Momentum Optimization:** We aggressively trimmed transition timers between game phases and removed distracting cinematic effects to keep the gameplay feeling fast and punchy.
- **Lobby Redesign:** The lobby was restructured so that profile customization and game settings were always visible. We disabled interactive settings for non-hosts (for transparency without confusion) and defaulted the player list to a closed state, prioritizing profile setup for new arrivals.
- **Modernized Aesthetics & Strategic Hiding:** We overhauled the UI with a sleek, glassmorphic design for the leaderboard. Crucially, we strategically hid total scores during specific phases to maintain suspense and preserve the integrity of the guessing phase.

## 5. Play Store Policy Compliance & Permissions
**The Problem:** 
The application initially requested `USE_EXACT_ALARM` and `SCHEDULE_EXACT_ALARM` permissions. This triggered strict Google Play Store policy flags, threatening to block deployment or require complex justifications.

**The Approach & Solution:**
- **Audit & Removal:** We audited the notification and alarm systems and aggressively stripped these permissions from `app.config.ts`.
- **Validation:** We verified that standard, less restrictive background scheduling was sufficient and that removing the exact alarms didn't break game functionality.

## 6. Session Integrity & Player Dropouts
**The Problem:** 
Handling players leaving mid-game gracefully without corrupting the match for others was difficult, leading to broken game states.

**The Approach & Solution:**
- **Strict Termination Policy:** We adopted an "All-or-Nothing" approach. If any human player drops out or disconnects during an active game, the session is immediately terminated. This hardline rule prevents broken lobbies and preserves the competitive integrity of the match.
