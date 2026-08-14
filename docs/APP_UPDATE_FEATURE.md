# App Update Feature — Full Technical Documentation

## Overview

The Chor Police app implements a **dual-path app update system** that supports both **native store redirects** (for major version bumps) and **OTA (Over-The-Air) updates** (for minor/patch updates via Expo). The system also enforces **version compatibility in LAN multiplayer** by rejecting clients with outdated app versions.

---

## Architecture Summary

| Layer | File(s) | Responsibility |
|-------|---------|----------------|
| Configuration | `app.config.ts`, `eas.json` | Expo Updates config, version source |
| Remote Config | `utils/versionCheck.ts` | Fetch & validate remote version JSON |
| Semver Utilities | `utils/semver.ts` | Version parsing, comparison, normalization |
| Core Hook | `hooks/useOTAUpdate.tsx` | Orchestrates check, download, apply via React Context |
| Full-screen Modal | `modal/UpdateAppModal.tsx` | Update prompt (native + OTA), shown only on allowed screens |
| App Controller | `components/AppController.tsx` | Wraps app flow (splash/onboarding/home), no update UI |
| Game Mode Select | `screens/GameModeScreen/GameModeSelectScreen.tsx` | Renders UpdateAppModal for Single Player + Multiplayer routes |
| LAN Enforcement | `service/network/LobbyPacketHandler.ts` | Rejects outdated clients in multiplayer |
| Join Packet Builder | `service/network/LobbyDataHelpers.ts` | Includes appVersion in PLAYER_JOIN |

---

## 1. Configuration Layer

### `app.config.ts`
```ts
runtimeVersion: { policy: "appVersion" },
updates: {
  url: "https://u.expo.dev/d2d7084f-7e5a-4b67-a860-dc2eddc33241",
  checkAutomatically: "NEVER",
  fallbackToCacheTimeout: 0,
}
```
- **`runtimeVersion.policy: "appVersion"`** — Expo uses the app's semantic version to determine if a build is compatible with an OTA update.
- **`checkAutomatically: "NEVER"`** — Disables Expo's built-in automatic update check. The app performs update checks manually via the custom hook.
- **`fallbackToCacheTimeout: 0`** — No fallback to cached bundle if the update server is unreachable.

### `eas.json`
```ts
{
  "cli": {
    "version": ">= 14.0.3",
    "appVersionSource": "local"
  }
}
```
- **`appVersionSource: "local"`** — Version is managed locally in `app.config.ts` (currently `7.0.0`), not auto-incremented by EAS.

### Current Version
- **App version**: `7.0.0` (set in `app.config.ts`)
- **Android versionCode**: `107` (set in `app.config.ts` → `android.versionCode`)

---

## 2. Remote Version Config (`utils/versionCheck.ts`)

### Remote Config Source
The app fetches a JSON config from a GitHub Gist:
```
https://gist.githubusercontent.com/Dheeraj23qw/895f8ccc58542c3c997ca6ca299b819e/raw/version.json
```
A cache-busting query param (`?t=${Date.now()}`) ensures fresh data on every check.

### Expected JSON Schema
```ts
interface RemoteVersionConfig {
  latestVersion: string;   // e.g. "7.1.0"
  updateUrl: string;       // HTTPS URL to Play Store / App Store
  isMandatory: boolean;    // true = user cannot skip
}
```

### Validation (`validateRemoteVersionConfig`)
1. **`latestVersion`** must be a valid semver string (validated via `isValidSemver` + `normalizeSemver`).
2. **`updateUrl`** must be an HTTPS URL pointing to an allowed domain:
   - `play.google.com`
   - `apps.apple.com`
   - `expo.dev`
3. **`isMandatory`** defaults to `false` if not a boolean.

If validation fails, the function returns `null` and the update check gracefully reports no update available.

### `checkAppUpdate()` Flow
1. Fetches the remote JSON with `cache: "no-store"`.
2. Validates the config.
3. Compares `Constants.expoConfig?.version` (current) with `config.latestVersion` (remote).
4. Returns:
   ```ts
   {
     isAvailable: boolean;      // true if versions differ
     latestVersion: string;     // normalized remote version
     updateUrl: string;         // validated HTTPS URL
     isMandatory: boolean;      // from remote config
   }
   ```
5. On any error (network, invalid JSON, validation failure), returns `isAvailable: false` — **no update is forced on failure**.

---

## 3. Semver Utilities (`utils/semver.ts`)

| Function | Purpose |
|----------|---------|
| `isValidSemver(version)` | Validates `X.Y.Z` pattern via regex `^(\d+)(\.(\d+)(\.(\d+))?)?$` |
| `normalizeSemver(version)` | Strips `v` prefix, pads to 3 segments (e.g. `7.0` → `7.0.0`) |
| `parseSemver(version)` | Returns `[major, minor, patch]` tuple or `null` |
| `compareVersions(v1, v2)` | Returns `-1`, `0`, or `1` by comparing segments left-to-right |
| `isNewerVersion(current, latest)` | Returns `true` if `current < latest` (i.e. current is outdated) |

---

## 4. Core Update Hook (`hooks/useOTAUpdate.ts`)

### State Machine
```
idle → checking → native-update (redirect to store)
                    → ota-downloading → ota-ready (reload)
                    → idle (no update available)
                    → error (check failed)
```

### `UpdateCheckState` Type
```ts
type UpdateCheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "native-update"; version: string; mandatory: boolean; url: string }
  | { status: "ota-downloading" }
  | { status: "ota-ready" }
  | { status: "error"; message: string };
```

### `checkAndApplyUpdate()` — The Main Check Flow
Guarded by multiple race-condition preventions:
- **`globalUpdateLock`** — Module-level flag preventing concurrent checks.
- **`hasRunRef`** — Ensures the check runs only once per hook lifecycle.
- **`checkIdRef`** — Incremented counter to discard stale async results.
- **`__DEV__` / `!Updates.isEnabled`** — Skips check in dev mode or if Expo Updates is disabled.

**Step-by-step:**
1. Calls `checkAppUpdate()` (remote config check).
2. If remote config says update is available → sets state to `native-update` and stops (does NOT check OTA).
3. If no remote update → calls `Updates.checkForUpdateAsync()` (Expo OTA check) with a **10-second timeout**.
4. If OTA update is available → sets state to `ota-downloading`.
5. Calls `Updates.fetchUpdateAsync()` with a **60-second timeout**.
6. If new assets found → sets state to `ota-ready`.
7. If no OTA update → sets state to `idle`.

### `applyUpdate()` — Applying the Update
- **Native update** (`status === "native-update"`): Opens `updateUrl` in the device's browser/Play Store via `Linking.openURL()`.
- **OTA update** (`status === "ota-ready"`):
  - **Safety check**: If a game is currently active, throws `"Cannot restart during active game"`. The restart is deferred until the user returns to the home screen.
  - Calls `Updates.reloadAsync()` to restart the app with the new bundle.
  - Shows an "Applying Update..." screen during the process.

### `useOTAUpdate` Return Values
```ts
{
  updateState: UpdateCheckState,
  isUpdating: boolean,
  isNativeUpdate: boolean,
  otaAvailable: boolean,
  latestVersion: string,
  updateUrl: string,
  isMandatory: boolean,
  checkAndApplyUpdate: () => void,
  applyUpdate: () => Promise<void>,
  isGameActive: boolean,
}
```

### Auto-Trigger
The hook runs `checkAndApplyUpdate()` automatically on mount via a `useEffect` with `[checkAndApplyUpdate]` dependency.

---

## 5. Full-screen Update Modal (`modal/UpdateAppModal.tsx`)

### Props
```ts
interface UpdateAppModalProps {
  isVisible: boolean;
  onClose: () => void;
  updateUrl: string;
  latestVersion: string;
  isMandatory?: boolean;
  isOta?: boolean;
  onApplyOta?: () => Promise<void> | void;
}
```

### Behavior
- **Mandatory updates**: No backdrop dismiss, no close button, no "Maybe Later" button.
- **Optional native updates**: Has a close button (×) and "Maybe Later" button.
- **OTA updates**: No "Maybe Later" button (restart is quick and non-destructive).
- **Button text**: "Restart Now" for OTA, "Update Now" for native, "Opening..." during application.
- **Visuals**: Animated with `moti`, glassmorphism via `expo-blur`, glowing violet border, rocket icon, version card, feature highlights.

### Visibility Logic (in `AppController.tsx`)
```ts
const showUpdateModal =
  (updateState.status === "native-update" || updateState.status === "ota-ready") &&
  (!skippedUpdate || isMandatory) &&
  (isInitialFlow || isMandatory);
```
- The modal is shown during **initial app flow** (SPLASH, VIDEO, ONBOARDING) OR when the update is **mandatory** at any time.
- If the user skips an optional update, `skippedUpdate` is set to `true` and the modal won't reappear unless the update is mandatory.

### "Applying Update..." Screen
When `isUpdating` is true, the `AppController` renders a full-screen overlay with:
- `PremiumSplashCard` (intro image)
- "Applying Update..." text
- "The app will reload in a moment." subtitle

---

## 6. Inline Update Banner (`components/GameModeScreen/AppUpdateBanner.tsx`)

A compact, non-blocking banner shown at the bottom of the `GameModeSelectScreen`.

### Behavior
- Uses `AppBannerCard` with a rocket icon, "NEW UPDATE" title, and version badge.
- Visible when: `isNativeUpdate || otaAvailable || __DEV__`.
- In production (`!__DEV__`), only shown if the `useOTAUpdate` hook reports an available update.
- **Dev mode**: Always visible with `"v2.4.0 [DEV]"` badge; tapping shows a toast instead of performing an actual update.
- Tapping the banner:
  - OTA: calls `applyUpdate()` (which may defer if a game is active).
  - Native: opens `updateUrl` via `Linking.openURL()`.

### Integration in `GameModeSelectScreen.tsx`
```ts
const { isNativeUpdate, otaAvailable } = useOTAUpdate();
const hasUpdateBanner = __DEV__ || isNativeUpdate || otaAvailable;

// In JSX:
{!__DEV__ && hasUpdateBanner ? (
  <AppUpdateBanner />
) : null}
```

### `AppBannerCard` Component
A reusable, animated card with:
- Animated icon container with a pulsing glow ring (`moti` loop animation).
- BlurView + LinearGradient background.
- Shimmer accent line at the top.
- Configurable title, badge, description, CTA icon, colors, and border styles.

---

## 7. LAN Multiplayer Version Enforcement

### Client Side — `LobbyDataHelpers.ts`
When a client joins a LAN session, the `buildJoinPacket` function includes the current app version:
```ts
const appVersion = Constants.expoConfig?.version || "7.0.0";
return {
  type: NETWORK.PLAYER_JOIN,
  roomCode: state.roomCode,
  appVersion,  // ← sent to host
  player: { ... },
};
```

### Host Side — `LobbyPacketHandler.ts`
When the host receives a `PLAYER_JOIN` packet:
1. Extracts `clientAppVersion` from the packet.
2. Validates it as semver.
3. Calls `isNewerVersion(hostAppVersion, clientAppVersion)` — if `true`, the client's version is older.
4. If the client is outdated:
   - Logs a warning.
   - Sends an `UPDATE_REQUIRED` packet back to the client with `latestVersion: hostAppVersion`.
   - Rejects the join silently.

### Client Reaction — `LobbyPacketHandler.ts`
When the client receives an `UPDATE_REQUIRED` packet:
1. Sets connection status to `ERROR`.
2. Sets session error: `"Update required: Please update the app to vX.Y.Z to join this session."`
3. Shows an error toast: `"Update Required"` / `"Your app version is outdated. Please update to continue."`

### Network Constant
```ts
// constants/Networking.ts
UPDATE_REQUIRED: "UPDATE_REQUIRED",
```

---

## 8. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP STARTUP                               │
│                   (AppController mounts)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              useOTAUpdate hook auto-triggers                     │
│                  checkAndApplyUpdate()                           │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
               ▼                              ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │  Remote Config Check  │      │  Expo OTA Check      │
    │  checkAppUpdate()     │      │  Updates.check...    │
    │  (GitHub Gist)        │      │  (10s timeout)       │
    └──────────┬───────────┘      └──────────┬───────────┘
               │                              │
               ▼                              ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │  native-update        │      │  ota-downloading      │
    │  → open store URL     │      │  → Updates.fetch...  │
    │  (isMandatory?)       │      │  (60s timeout)       │
    └──────────┬───────────┘      └──────────┬───────────┘
               │                              │
               ▼                              ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │  UpdateAppModal       │      │  ota-ready           │
    │  "Update Now" /       │      │  → Updates.reload()  │
    │  "Maybe Later"        │      │  (deferred if game   │
    │  (mandatory blocks    │      │   is active)         │
    │   dismiss)            │      └──────────────────────┘
    └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              GAME MODE SELECT SCREEN                            │
│              (AppUpdateBanner at bottom)                        │
│  Shows compact banner for non-mandatory / in-progress awareness │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              LAN MULTIPLAYER                                     │
│  Client sends appVersion in PLAYER_JOIN →                        │
│  Host compares → if outdated, sends UPDATE_REQUIRED →            │
│  Client shows error toast & blocks session                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `checkAutomatically: "NEVER"` | Manual control avoids unexpected OTA downloads and gives the app full control over when/where to prompt. |
| Remote config from GitHub Gist | Simple, free, no backend required. Version + URL + mandatory flag can be updated instantly. |
| HTTPS domain whitelist for `updateUrl` | Security: prevents phishing/malicious redirects. Only Play Store, App Store, and expo.dev are allowed. |
| Global update lock (`globalUpdateLock`) | Prevents race conditions if the hook is mounted in multiple places simultaneously. |
| `hasRunRef` per hook instance | Ensures the check runs only once even if the component re-renders or the hook is used in multiple components. |
| `checkIdRef` for stale result cancellation | Each async operation increments the ID; results with mismatched IDs are discarded, preventing state updates from cancelled checks. |
| Deferred OTA restart during games | Calling `Updates.reloadAsync()` during an active game would crash the session. The hook checks `isGameActive` and throws, letting the UI defer until the user returns home. |
| Mandatory updates during initial flow only (or always) | Non-mandatory updates are only forced during SPLASH/VIDEO/ONBOARDING. Once the user reaches HOME, they can skip optional updates. Mandatory updates block the app regardless of current screen. |
| Version enforcement in LAN | LAN sessions run on local WiFi with no server. The host acts as the authority and rejects outdated clients to prevent protocol/feature mismatches. |

---

## 10. Files Reference

| File | Lines of Code | Role |
|------|---------------|------|
| `app.config.ts` | 15-21 | Expo Updates config, version, runtime version policy |
| `eas.json` | 1-5 | EAS CLI config, `appVersionSource: "local"` |
| `utils/versionCheck.ts` | 120 | Remote config fetch, validation, version comparison |
| `utils/semver.ts` | 39 | Semver parsing, normalization, comparison |
| `hooks/useOTAUpdate.ts` | 175 | Core hook: check, download, apply, state machine |
| `modal/UpdateAppModal.tsx` | 317 | Full-screen animated update modal |
| `components/GameModeScreen/AppUpdateBanner.tsx` | 49 | Compact inline banner for game mode select |
| `components/GameModeScreen/AppBannerCard.tsx` | 135 | Reusable animated banner card component |
| `components/AppController.tsx` | 228 | App flow controller, modal visibility logic |
| `screens/GameModeScreen/GameModeSelectScreen.tsx` | 183 | Hosts AppUpdateBanner, uses `useOTAUpdate` |
| `service/network/LobbyPacketHandler.ts` | 281 | LAN version enforcement, UPDATE_REQUIRED handling |
| `service/network/LobbyDataHelpers.ts` | 41 | Builds join packet with appVersion |
| `constants/Networking.ts` | 82 | `UPDATE_REQUIRED` packet type constant |

---

## 11. Update Paths Summary

| Scenario | Path | UI |
|----------|------|----|
| Remote config says update available | `native-update` → `UpdateAppModal` → open Play Store/App Store | Full-screen modal, "Update Now" |
| Expo OTA update available | `ota-ready` → `UpdateAppModal` → `Updates.reloadAsync()` | Full-screen modal "Restart Now" |
| No update available | `idle` | No UI shown |
| Check fails (network error) | `error` → `idle` | No UI shown, graceful fallback |
| LAN client outdated | Host sends `UPDATE_REQUIRED` → client shows toast + error screen | Toast + session error screen |
| OTA during active game | `downloadUpdate()` deferred (`ota-pending`) until game ends | Modal hidden, download silent & delayed |

---

## 12. Developer Guide — How to Update the App (5 Methods)

As a developer, there are **5 primary ways** to publish, trigger, or simulate app updates depending on the type of changes you are releasing:

---

### Method 1: Push an Instant Over-The-Air (OTA) Update (EAS Update)
*Best for: JavaScript/TypeScript changes, UI fixes, style updates, or minor bug fixes that do NOT include native code changes.*

1. Make your code changes in JS/TS.
2. Publish the OTA update to your Expo channel:
   ```bash
   eas update --branch production --message "Fix UI bug in lobby"
   ```
3. **How it reaches users**:
   - The app automatically checks Expo Updates on app launch.
   - If user is outside active gameplay, it downloads in the background (`ota-downloading` → `ota-ready`).
   - When the user navigates to Single Player or Multiplayer setup screens, `UpdateAppModal` prompts them with **"Restart Now"**.

---

### Method 2: Publish a Native Store Release (Play Store / App Store)
*Best for: Native module additions, Expo SDK upgrades, native config changes in `app.config.ts`, or major release version bumps (e.g. `7.0.0` → `8.0.0`).*

1. Bump `version` in `app.config.ts`:
   ```ts
   version: "7.1.0",
   android: {
     versionCode: 108,
   }
   ```
2. Build production binaries:
   ```bash
   eas build --platform android --profile production
   ```
3. Upload the resulting `.aab` / `.apk` to Google Play Console / Apple App Store.
4. **Trigger Native Update Modal for existing users**: Update the Remote Gist Config (see Method 3 below) to point `latestVersion` to `"7.1.0"`.

---

### Method 3: Update Remote Version Gist Configuration
*Best for: Triggering mandatory native update prompts, setting minimum required versions, or changing store redirect URLs.*

Remote Config URL:
```
https://gist.githubusercontent.com/Dheeraj23qw/895f8ccc58542c3c997ca6ca299b819e/raw/version.json
```

1. Edit your GitHub Gist `version.json` payload:
   ```json
   {
     "latestVersion": "7.1.0",
     "updateUrl": "https://play.google.com/store/apps/details?id=com.dheeraj.chorpolice",
     "isMandatory": true
   }
   ```
2. **Behavior**:
   - **`latestVersion` higher than client**: Shows `UpdateAppModal` with **"Update Now"**.
   - **`isMandatory: true`**: Hides "Maybe Later" dismiss button and blocks Android back button.
   - **`isMandatory: false`**: User can dismiss with "Maybe Later".

---

### Method 4: Enforce LAN Multiplayer Minimum Version
*Best for: Preventing network protocol mismatches between local host & client devices during LAN play.*

1. When a client sends a `PLAYER_JOIN` packet, `LobbyPacketHandler.ts` checks the client's `appVersion`.
2. If `hostAppVersion > clientAppVersion`:
   - Host sends `UPDATE_REQUIRED`.
   - Client is rejected from joining and receives a clear error message requiring them to update.

---

### Method 5: Local Testing & Debugging Updates in `__DEV__` Mode
*Best for: Verifying modal UI layout, button actions, or animations without publishing builds.*

1. In `__DEV__`, Expo OTA automatic checking is disabled to avoid corrupting dev bundles.
2. To test `UpdateAppModal` visually:
   ```tsx
   <UpdateAppModal
     isVisible={true}
     onClose={() => {}}
     updateUrl="https://play.google.com/store"
     latestVersion="7.1.0"
     isMandatory={false}
     isOta={true}
     onApplyOta={async () => console.log("Apply OTA pressed")}
   />
   ```

