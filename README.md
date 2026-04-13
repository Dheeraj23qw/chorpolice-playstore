# 🎭 Chor Police

A real-time **LAN multiplayer card game** built with React Native + Expo. Players are assigned secret roles — King, Police, Thief, or Advisor — and the Police must identify the Thief before time runs out.

Also includes a **Think & Count** (Quiz) multiplayer mode.

---

## 🎮 Game Modes

| Mode | Players | Description |
|---|:---:|---|
| **Chor Police (Offline)** | 1 | Solo play against local state. Tap cards to reveal roles. |
| **Chor Police (Online)** | 4 | LAN multiplayer. Each player sees only their own role. Police guesses the Thief. Bots fill empty slots. |
| **Think & Count (Online)** | 2-10 | LAN multiplayer quiz. Timed rounds with synchronized leaderboards. |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) (SDK 54) + [expo-router](https://docs.expo.dev/router/introduction/) |
| UI | React Native 0.81, [NativeWind](https://www.nativewind.dev/) (Tailwind for RN) |
| Animations | [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) + RN `Animated` API |
| State | [Redux Toolkit](https://redux-toolkit.js.org/) + [MMKV](https://github.com/mrousavy/react-native-mmkv) |
| Networking | [react-native-tcp-socket](https://github.com/nickhillzz/react-native-tcp-socket) + [react-native-udp](https://github.com/nickhillzz/react-native-udp) |
| Audio | expo-audio |

---

## 📁 Project Structure

```
chorpolice/
├── app/                    # Expo Router file-based routes
│   └── (game)/
│       ├── chor-police/    # Offline game route
│       ├── chor-police-mp/ # Online multiplayer route
│       ├── think-count-quiz/
│       └── lobby/
│
├── service/                # Networking & game engines (SOLID)
│   ├── PacketRouter.ts     # Routes packets to registered engines (OCP)
│   ├── lanGameService.ts   # Low-level TCP/UDP packet I/O
│   ├── ChorPoliceEngine.ts # CP game rules (IGameEngine)
│   ├── ChorPoliceBotBehavior.ts # Bot AI for CP
│   ├── QuizEngine.ts       # Quiz game rules (IGameEngine)
│   ├── BotEngine.ts        # Generic bot spawning for lobby
│   └── interfaces/
│       └── IGameEngine.ts  # Engine contract
│
├── hooks/                  # React hooks (business logic)
│   ├── useChorPoliceMultiplayer.ts
│   ├── useLobbyLogic.ts
│   ├── useRajaMantriGame/  # Offline CP game logic
│   └── questionhook/       # Quiz game logic
│
├── screens/                # Screen components
│   ├── ChorPoliceMultiplayer/
│   │   ├── ChorPoliceMultiplayerScreen.tsx
│   │   └── views/          # Role-specific views
│   ├── RajaMantriGameScreen/ # Offline CP screen
│   └── LobbyScreen.tsx
│
├── components/             # Reusable UI components
│   ├── RajamantriGameScreen/
│   │   └── cardComponent.tsx   # Flip card with role images
│   ├── QuizLobby/          # Lobby UI components
│   └── feedback/           # Custom toast system
│
├── modal/                  # Modal screens
│   ├── overlaypop.tsx      # King/Police identity reveal
│   ├── DynamicPopUpModal.tsx # Win/Lose GIF overlay
│   ├── ShowTableModal.tsx  # Round-by-round scoreboard
│   ├── QuizExitModal.tsx   # Premium exit confirmation
│   └── BettingModal.tsx    # Stake selection
│
├── constants/              # Config & constants
│   ├── Networking.ts       # Packet types (CP_*, TC_*)
│   └── gamemode.ts         # Game mode definitions
│
├── redux/                  # Redux store & slices
├── features/               # Feature modules (wallet, etc.)
├── Animations/             # Card flip & bounce animations
├── audio/                  # Audio engine & sound files
└── assets/                 # Images, fonts
```

---

## 🌐 Multiplayer Architecture

### SOLID Principles

The networking layer follows strict SOLID principles:

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│  UI Hooks        │ ◄── │ lanGameService│ ◄── │   PacketRouter   │
│  (subscribe to   │     │ (packet I/O) │     │ (routes to       │
│   packet stream) │     └──────────────┘     │  registered      │
└─────────────────┘              ▲             │  engines)        │
                                 │             └────────┬─────────┘
                                 │                      │
                          ┌──────┴──────┐    ┌──────────▼──────────┐
                          │ Broadcast   │    │ ChorPoliceEngine    │
                          │ (back to    │    │ QuizEngine          │
                          │  listeners) │    │ (self-register      │
                          └─────────────┘    │  via canHandle)     │
                                             └─────────────────────┘
```

- **SRP**: Each engine handles only its game rules. No UI, no bots.
- **OCP**: Engines self-register with `PacketRouter`. Adding a new game requires zero changes to the router.
- **LSP**: Both engines implement `IGameEngine` — the router treats them identically.
- **DIP**: Hooks depend on the packet stream abstraction, never on engine methods directly.

### Packet Flow

```
User Action → Hook → lanGameService → PacketRouter → Engine
                                                        │
Engine broadcasts result → PacketRouter → lanGameService → All Hooks
```

### Role-Based Visibility (Chor Police)

| Role | Sees Board? | Can Click? | During Police Turn |
|:---:|:---:|:---:|---|
| **Police** | ✅ | ✅ | Taps hidden cards to find the Thief |
| **King** | ✅ | ❌ | Watches the investigation (spectator) |
| **Thief** | ❌ | ❌ | Sees private 🦹 card → "Stay hidden!" |
| **Advisor** | ❌ | ❌ | Sees private 🧠 card → "Police is investigating..." |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

### Install & Run

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Build

```bash
# Development build
npm run build:dev

# Production build
npm run build:prod

# Preview build (APK)
npm run preview
```

### OTA Updates

```bash
# Push update to production
npm run update:prod

# Push update to preview
npm run update:preview
```

---

## 🎯 Scoring (Chor Police)

| Outcome | 👑 King | 🧠 Advisor | 🚔 Police | 🦹 Thief |
|:---:|:---:|:---:|:---:|:---:|
| Police catches Thief | 1000 | 800 | 500 | 0 |
| Thief escapes | 1000 | 800 | 0 | 500 |

Scores accumulate across rounds. Winner gets the betting pot.

---

## 🤖 Bot System

When no real players are nearby, bots fill the lobby to exactly 4 players:

- **Lobby**: `BotEngine.spawn(3)` creates virtual players with unique names and avatars
- **Game**: `ChorPoliceBotBehavior` listens for role assignments
  - If a bot gets **Police** → auto-guesses after 2-4s (50/50 random)
  - All other roles are passive (no action needed)

---

## 🔍 Debugging

In `__DEV__` mode, every component logs with tagged prefixes:

| Tag | Source |
|---|---|
| `🎭 [CPEngine]` | Game engine state transitions |
| `🤖 [CPBots]` | Bot decisions and timing |
| `🎭 [CPHook]` | UI state changes and guard rejections |
| `[DEBUG]` | Raw packet audit trail |
| `🧩 [Router]` | Engine registration |

> **Tip**: Search for `═══` in the console to find major state changes (role shuffles, guess evaluations).

---

## 📄 License

Private. All rights reserved.
