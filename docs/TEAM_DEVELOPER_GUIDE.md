# Chor Police — Team Developer Handbook & Comprehensive Architecture Guide

Welcome to the **Chor Police** codebase! This comprehensive guide is designed for engineering team members, contractors, and AI coding assistants to quickly understand the project setup, system architecture, coding conventions, networking protocol, update workflows, and release processes.

---

## 1. Project Overview & Technology Stack

**Chor Police** is a modern React Native / Expo cross-platform multiplayer card & bluffing strategy game.

### Core Stack
- **Framework**: Expo SDK 56 + React Native (`react-native` 0.76+)
- **Navigation**: Expo Router v4 (File-based routing under `app/`)
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)
- **Styling**: NativeWind v4 / Tailwind CSS + Vanilla CSS (`styles/global.css`)
- **Animations**: Reanimated v3 + `moti` + Expo Blur + Expo Linear Gradient
- **Audio Engine**: Custom sound manager built on `expo-audio`
- **Networking**: Custom zero-cloud P2P LAN TCP engine using `react-native-tcp-socket`
- **Vector Icons**: `@expo/vector-icons` + `lucide-react-native`
- **Update System**: Expo Updates (`expo-updates` / EAS Update) + Custom Remote Config Gist

---

## 2. Directory Structure & Codebase Sitemap

```
chorpolice/
├── app/                        # Expo Router file-based pages & layouts
│   ├── _layout.tsx             # Root layout (Redux, UpdateProvider, ErrorBoundary)
│   ├── index.tsx               # Entry redirect & splash/onboarding controller
│   ├── (tabs)/                 # Bottom tab screens (Home, Profile, Settings)
│   ├── single-player/          # Single Player setup & gameplay routes
│   ├── multiplayer/            # Multiplayer permission & mode select routes
│   ├── host/                   # Host room creation & QR code generation
│   ├── join/                   # QR scanner & Join room screen
│   ├── lobby/                  # Pre-game lobby room setup
│   └── chor-police-mp/         # Main multiplayer game board
├── components/                 # Reusable UI components
│   ├── AppController.tsx       # Flow controller (Splash → Onboarding → Video → Home)
│   ├── GameModeScreen/         # Mode selection rows & drawer sections
│   ├── LobbyScreen/            # Host invite card, debug overlays, lobby headers
│   └── JoinScreen/             # QR scanner container section
├── modal/                      # Modals (UpdateAppModal, RatingModal, SpinToWinModal)
├── redux/                      # Redux Toolkit store, slices, and selectors
│   ├── store.ts                # App Redux store
│   ├── reducers/               # Redux slices (sessionSlice, playerReducer, walletSlice)
│   └── selectors/              # Reselect state selectors
├── service/                    # Business services & networking
│   ├── lanLobbyCoordinator.ts  # Master lobby & socket coordinator
│   ├── lanGameService.ts       # Network packet routing & socket manager
│   ├── ChorPoliceEngine.ts     # Offline & online game state rule engine
│   └── network/                # Low-level TCP framing, handshake, & transport
│       ├── GameSessionTransport.ts  # TCP server/client manager with safeSend()
│       ├── TcpFraming.ts            # 4-byte length-prefixed packet encoder/decoder
│       ├── LobbyPacketHandler.ts    # Packet parsing & host room validation
│       └── HeartbeatService.ts      # Ping/pong keep-alive loop
├── hooks/                      # Custom hooks
│   ├── useOTAUpdate.tsx        # Centralized app update hook & state
│   ├── useChorPoliceMultiplayer/ # Main multiplayer game engine hook
│   └── useSystemUI.ts          # Native UI bar color & layout hook
├── utils/                      # Utilities (semver, versionCheck, responsive math)
└── docs/                       # Project documentation
    ├── APP_UPDATE_FEATURE.md        # Full update system documentation
    ├── LAN_NETWORKING_ARCHITECTURE.md# Backend TCP packet & network architecture
    ├── LAN_GAMEPLAY_FLOW.md         # Game phase lifecycle reference
    ├── VERSION_BUMP_CHECKLIST.md    # 7-file release checklist
    └── TEAM_DEVELOPER_GUIDE.md      # (This handbook)
```

---

## 3. Key Development Rules & Conventions

### Rule 1: Expo 56 `<LinearGradient>` Rule (CRITICAL)
In Expo SDK 56, **never** apply flexbox layout classes (`flex-row`, `items-center`, `justify-center`, `gap-*`) directly to `<LinearGradient>` via `className`.

**Required Pattern**:
```tsx
<TouchableOpacity
  onPress={handlePress}
  className="h-16 overflow-hidden rounded-[24px]"
>
  <LinearGradient
    colors={["#818CF8", "#6366F1", "#4F46E5"]}
    style={StyleSheet.absoluteFill}
  >
    <View className="h-full flex-row items-center justify-center gap-2">
      <MaterialCommunityIcons name="check-circle" size={22} color="white" />
      <Text className="font-main-bold text-white">Start Game</Text>
    </View>
  </LinearGradient>
</TouchableOpacity>
```

### Rule 2: Active Gameplay Protection
Never trigger disruptive popups, auto-downloads, or app reloads during active gameplay phases (`waiting`, `dealing`, `police_turn`, `result`, etc.).

### Rule 3: Error Traceback Inspection
Never guess runtime failures. Always read the exact error traceback before modifying code. Never mask errors by suppressing exceptions silently.

---

## 4. State Management (Redux Architecture)

The app uses Redux Toolkit (`redux/store.ts`) for global state:

- **`sessionSlice`**: Tracks player role, room code, `isHost`, `connectionStatus` (`IDLE`, `HOSTING`, `CONNECTING`, `CONNECTED`, `ERROR`), and `gamePhase`.
- **`playerReducer`**: Manages local player profile, score multipliers, and avatar selections.
- **`walletSlice`**: Tracks coins, daily bonuses, and rewards.
- **`soundReducer`**: Manages background music & sound effect mute states.

---

## 5. LAN Multiplayer Networking Overview

Local multiplayer operates on a zero-server P2P model over local Wi-Fi or Hotspot:

1. **TCP Port Binding**: Host binds server to port `41235` (or fallback ports `41236..41240`).
2. **Binary Framing**: Packets are length-prefixed `[4-byte BE UInt32 length][JSON payload]` in [`TcpFraming.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/service/network/TcpFraming.ts).
3. **Safe Socket Writes**: All socket writes go through `GameSessionTransport.safeSend()` to prevent crash-on-closed-socket exceptions.
4. **Heartbeat Self-Healing**: Host broadcasts player list every 3 seconds to automatically recover dropped packets over Wi-Fi.

> 📖 **Full Details**: Read [`docs/LAN_NETWORKING_ARCHITECTURE.md`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/docs/LAN_NETWORKING_ARCHITECTURE.md) and [`docs/LAN_GAMEPLAY_FLOW.md`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/docs/LAN_GAMEPLAY_FLOW.md).

---

## 6. App Update System & OTA Updates

The app features a dual-path update architecture:

- **Native Store Updates**: Prompted via `UpdateAppModal` on Single Player & Multiplayer screens when a major store version is available.
- **Over-The-Air (OTA) Updates**: JS/UI updates published directly from developer laptops via EAS Update.

### Pushing Live UI Updates From Laptop:
```bash
eas update --branch production --message "Update lobby styling and colors"
```
Users receive UI updates over the air without needing a new Play Store submission!

> 📖 **Full Details**: Read [`docs/APP_UPDATE_FEATURE.md`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/docs/APP_UPDATE_FEATURE.md).

---

## 7. Version Bumping & Release Process

When releasing a new APK / AAB on Google Play Store:

1. Follow the **7-file checklist** in [`docs/VERSION_BUMP_CHECKLIST.md`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/docs/VERSION_BUMP_CHECKLIST.md):
   - `app.config.ts` (`version` & `versionCode`)
   - `package.json` (`version`)
   - `android/app/build.gradle` (`versionCode` & `versionName`)
   - `service/network/LobbyDataHelpers.ts`
   - `service/network/LobbyPacketHandler.ts`
   - `utils/versionCheck.ts`
   - GitHub Gist `version.json`
2. Run local release build:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
3. Output AAB will be saved at:
   `android/app/build/outputs/bundle/release/app-release.aab`

---

## 8. Common Troubleshooting & FAQs

### Q1: R8 / ProGuard failure during `./gradlew assembleRelease`?
- **Cause**: Missing class references in Firebase or third-party libraries.
- **Fix**: Check [`android/app/proguard-rules.pro`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/android/app/proguard-rules.pro) and ensure `-dontwarn com.google.firebase.**` rules are present.

### Q2: Play Store rejects AAB with "Signed with debug key"?
- **Fix**: Ensure `signingConfigs.release` in [`android/app/build.gradle`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/android/app/build.gradle) points to `credentials/android/keystore.jks`.

### Q3: Players cannot see each other on public Wi-Fi?
- **Cause**: Router AP / Client Isolation.
- **Fix**: Ask players to enable **Mobile Hotspot** on one device and connect friends to it.

---

## 9. Contacts & Resources

- **Main Repository**: `Dchanger/chorpolice`
- **Documentation Hub**: See [`docs/`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/docs/) directory.
