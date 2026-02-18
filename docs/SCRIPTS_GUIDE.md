# Chor Police: Development Guide

## 🚀 Development Commands

| Command | Purpose | When to Use |
| :--- | :--- | :--- |
| `npm run start` | Launches Metro Bundler | Use for standard JS-only updates if the app is already on your device |
| `npm run android` | Native Build & Run | **Most important command.** Use when adding new packages or changing native config |
| `npm run dev` | Dev Client Start | Run with support for custom native modules (Nitro/MMKV) |
| `npm run clean` | Deep Project Reset | If app crashes on boot or styles (NativeWind) aren't updating |
| `npm run lint` | Code Style Check | Run before pushing to ensure consistent code style |
| `npm run ts:check` | TypeScript Validation | Find hidden logic errors without running the app |
| `npm run prebuild` | Native Code Generation | Debug `/android` folder or inspect Gradle files |

---

## 📦 Build & Deployment

| Command | Purpose | When to Use |
| :--- | :--- | :--- |
| `npm run build:prod` | Production Play Store | Generates signed `.aab` for Google Play |
| `npm run build:dev` | Internal Testing | Dev build with Dev Menu enabled |
| `npm run preview` | Generate APK | Creates `.apk` for quick sharing/testing |
| `npm run submit` | Play Store Upload | Sends latest production build to Play Console |

---

## 🔥 OTA & Safety

| Command | Purpose | When to Use |
| :--- | :--- | :--- |
| `npm run update:prod` | Hot Fix (OTA) | Push UI/features instantly without Play Store approval |
| `npm run fingerprint` | Native Safety Check | Check if OTA is safe or native rebuild is required |
| `npm run test` | Unit Testing | Ensure core logic doesn't break during updates |
