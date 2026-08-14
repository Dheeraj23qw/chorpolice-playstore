# LAN Multiplayer Game Flow & Lifecycle Guide

## Overview

This document explains the end-to-end **LAN Multiplayer Game Flow** in Chor Police. It provides a roadmap of screens, state transitions, hooks, network packets, and game phases so developers and AI agents can quickly navigate and maintain the multiplayer codebase.

---

## 1. High-Level Architecture Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     1. Entry & Permissions                      │
│     app/multiplayer/index.tsx → Checks Android/iOS permissions  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     2. Mode Select & Host/Join                  │
│  Host: app/host/index.tsx   │   Join: app/join/index.tsx        │
│  Calls hostLanLobby()       │   Scans QR / probeAsync()         │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     3. Lobby Setup Screen                       │
│    app/lobby/index.tsx (LobbySetupScreen.tsx)                   │
│    - Player list sync, round count, stake, bot fillers         │
│    - Host taps "Start Game" → Sends GAME_START                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 4. Chor Police Multiplayer Gameplay             │
│    app/chor-police-mp/index.tsx                                │
│    Hook: useChorPoliceMultiplayer()                             │
│    Phases: waiting → dealing → private_reveal →                 │
│            investigation_shuffle → police_turn → result        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     5. Results & Final Summary                  │
│    app/quiz-result/index.tsx                                    │
│    - Shows final score leaderboard, awards coins, play again    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Phase-by-Phase Game Lifecycle

### Phase 1: Entry & Permission Check (`app/multiplayer/index.tsx`)
- Checks location (`ACCESS_FINE_LOCATION`) and nearby devices (`NEARBY_WIFI_DEVICES`) permissions on Android.
- Renders `GameModeSelectScreen` with `drawerContext="multiplayer"`.

### Phase 2: Host Room Creation (`app/host/index.tsx`)
- Calls `initHostLobby()` and `hostLanLobby()`.
- Binds TCP server to port `41235` (or fallback).
- Launches IP detection loop (`startIpDetectionLoop`).
- Generates QR JSON payload: `{ "host": "192.168.x.x", "port": 41235, "version": "1.0", "sessionId": "..." }`.

### Phase 3: Guest Join Flow (`app/join/index.tsx` & `JoinScreen.tsx`)
- Lazy camera scanner (`QRScanner.tsx`) decodes QR payload.
- Validates host IPv4 address (`isValidIpv4`).
- Probes host via TCP `probeAsync()` with 800ms timeout (`PING`/`PONG` handshake).
- Sends `PLAYER_JOIN` packet containing `appVersion`.
- Host checks room capacity (<4 players), game state (`idle`), room code, and version compatibility (`isNewerVersion`).
- Upon acceptance, host responds with `PLAYER_LIST_UPDATE`. Guest auto-navigates to `/lobby`.

### Phase 4: Lobby Setup (`screens/LobbySetupScreen.tsx`)
- Host selects total rounds (3, 5, 10), card deal animation preset (`classicSpin`, `tornadoDeal`, `waveDeal`, `orbitDeal`), stake amount, or fills empty slots with smart bots.
- Host taps **"Start Game"** -> dispatches `GAME_START` packet across all TCP sockets -> all players navigate to `/chor-police-mp`.

### Phase 5: Gameplay Phase Loop (`useChorPoliceMultiplayer.ts`)

The active match transitions through the following `GamePhase` states:

| GamePhase | Description | Action / Event |
|:---|:---|:---|
| **`waiting`** | Intermission between rounds | Host taps "Play Round", dispatches `DEAL_CARDS` packet. |
| **`dealing`** | Card deal animation | Executes selected deal animation preset (`useDealingStage`). |
| **`private_reveal`** | Secret role inspection | Each player sees their assigned secret role (`King`, `Police`, `Thief`, `Advisor`). |
| **`investigation_shuffle`** | Mystery card shuffle | Cards shuffle face-down on table (`useMysteryShuffle`). |
| **`police_turn`** | Police investigation turn | Police player (or bot) taps a card to identify the Thief. |
| **`result`** | Round result & scoring | Reveals all cards, awards round points/coins, plays audio FX. |
| **`score_quiz`** | Optional bonus trivia | Players answer quick quiz question for bonus points (`useCPScoreQuiz`). |
| **`final_result`** | Game over & leaderboard | Final round completed; transitions to summary & coin payout. |

---

## 3. Key Files & Reference Map

### Core Navigation Routes (`app/`)
- `app/multiplayer/index.tsx` — Multiplayer permission & mode selection.
- `app/host/index.tsx` — Host setup & QR code display.
- `app/join/index.tsx` — Join room & camera scanner.
- `app/lobby/index.tsx` — Pre-game lobby room.
- `app/chor-police-mp/index.tsx` — Main gameplay view.

### Network Services (`service/`)
- [`service/lanLobbyCoordinator.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/service/lanLobbyCoordinator.ts) — High-level lobby & socket orchestrator.
- [`service/lanGameService.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/service/lanGameService.ts) — Low-level packet router & TCP transport manager.
- [`service/network/LobbyPacketHandler.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/service/network/LobbyPacketHandler.ts) — Packet decoding & room logic.
- [`service/network/GameSessionTransport.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/service/network/GameSessionTransport.ts) — Native TCP socket handling & `safeSend()`.
- [`service/network/TcpFraming.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/service/network/TcpFraming.ts) — 4-byte length-prefixed packet encoder/decoder.

### Gameplay Hooks (`hooks/`)
- [`hooks/useChorPoliceMultiplayer/useChorPoliceMultiplayer.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/hooks/useChorPoliceMultiplayer/useChorPoliceMultiplayer.ts) — Master gameplay state hook.
- `hooks/chorPoliceMultiplayer/handlers/packetRouter.ts` — In-game packet router.
- `hooks/chorPoliceMultiplayer/useCPRevealSequence.ts` — Card flip & reveal manager.
- `hooks/chorPoliceMultiplayer/useCPScoreQuiz.ts` — Bonus quiz round logic.

### Redux State (`redux/reducers/`)
- [`redux/reducers/sessionSlice.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/redux/reducers/sessionSlice.ts) — Manages `isHost`, `connectionStatus`, `gamePhase`, `players`, `roomCode`, and `lobbyStage`.

---

## 4. Useful Tips for Developers & Agents

1. **Active Gameplay Protection**: OTA updates are deferred (`ota-pending`) during active game phases (`waiting`, `dealing`, `police_turn`, `result`, etc.) to prevent session disruption.
2. **Bot Integration**: `BotEngine.ts` automatically takes turns for bot players in single-player or partially filled multiplayer lobbies.
3. **Heartbeat Self-Healing**: Host periodically sends `PLAYER_LIST_UPDATE` every 3 seconds to auto-recover dropped packets over Wi-Fi.
