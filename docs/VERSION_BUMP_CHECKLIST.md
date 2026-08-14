# App Version Bump Checklist & File Guide

Use this checklist every time you prepare a new release for the **Google Play Store / App Store** or publish a new major version bump.

---

## Required Files to Update (7 Files)

Whenever updating the app version (e.g. bumping from `7.5.0` to `7.6.0` and `versionCode` from `110` to `111`), modify the following files:

---

### 1. `app.config.ts`
- **File Path**: [`app.config.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/app.config.ts)
- **Properties to update**:
  ```ts
  version: "7.5.0",           // Update semantic version string
  android: {
    versionCode: 110,         // Increment integer versionCode (must be > previous release)
  }
  ```

---

### 2. `package.json`
- **File Path**: [`package.json`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/package.json)
- **Property to update**:
  ```json
  "version": "7.5.0"          // Update project version
  ```

---

### 3. `android/app/build.gradle`
- **File Path**: [`android/app/build.gradle`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/android/app/build.gradle)
- **Properties to update** (inside `defaultConfig`):
  ```groovy
  versionCode 110             // Must match app.config.ts versionCode
  versionName "7.5.0"         // Must match app.config.ts version
  ```

---

### 4. `service/network/LobbyDataHelpers.ts`
- **File Path**: [`service/network/LobbyDataHelpers.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/service/network/LobbyDataHelpers.ts)
- **Fallback version fallback string**:
  ```ts
  const appVersion = Constants.expoConfig?.version || "7.5.0";
  ```

---

### 5. `service/network/LobbyPacketHandler.ts`
- **File Path**: [`service/network/LobbyPacketHandler.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/service/network/LobbyPacketHandler.ts)
- **Fallback version string**:
  ```ts
  const hostAppVersion = Constants.expoConfig?.version || "7.5.0";
  ```

---

### 6. `utils/versionCheck.ts`
- **File Path**: [`utils/versionCheck.ts`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/utils/versionCheck.ts)
- **Fallback version string**:
  ```ts
  const currentVersion = Constants.expoConfig?.version || "7.5.0";
  ```

---

### 7. Remote Version Config Gist (`version.json`)
- **Gist URL**: `https://gist.githubusercontent.com/Dheeraj23qw/895f8ccc58542c3c997ca6ca299b819e/raw/version.json`
- **JSON Payload to update**:
  ```json
  {
    "latestVersion": "7.5.0",
    "updateUrl": "https://play.google.com/store/apps/details?id=com.dheeraj.chorpolice",
    "isMandatory": false
  }
  ```

---

## Documentation Files to Sync (Optional)

- [`docs/APP_UPDATE_FEATURE.md`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/docs/APP_UPDATE_FEATURE.md) (Update `### Current Version` section)
- [`docs/LAN_NETWORKING_ARCHITECTURE.md`](file:///c:/Users/rahul/work/chorpolice-1/chorpolice/docs/LAN_NETWORKING_ARCHITECTURE.md) (Example packet payloads)

---

## Verification Commands After Version Bump

Run these commands in your terminal before building:

```bash
# 1. Verify TypeScript compilation
npx tsc --noEmit

# 2. Build Release AAB locally
cd android
./gradlew bundleRelease

# 3. Or Cloud EAS Build
eas build --platform android --profile production
```
