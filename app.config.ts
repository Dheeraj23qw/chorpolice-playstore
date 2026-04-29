import "tsx/cjs";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Chor Police",
  slug: "chorpolice",
  version: "4.1.0",
  platforms: ["android"],
  orientation: "portrait",
  scheme: "chorpolice",
  userInterfaceStyle: "dark",
  backgroundColor: "#050508",
  androidStatusBar: {
    barStyle: "light-content",
    backgroundColor: "#050508",
    translucent: true,
    hidden: true,
  },
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#050508",
  },
  icon: "./assets/images/adaptive-icon.png",
  runtimeVersion: { policy: "appVersion" },
  assetBundlePatterns: ["assets/images/*", "assets/audio/*", "assets/gif/*"],
  updates: {
    url: "https://u.expo.dev/d2d7084f-7e5a-4b67-a860-dc2eddc33241",
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 0,
  },
  android: {
    package: "com.dheeraj.chorpolice",
    userInterfaceStyle: "dark",
    allowBackup: false,
    softwareKeyboardLayoutMode: "pan",
    versionCode: 101,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    permissions: [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.ACCESS_WIFI_STATE",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.CHANGE_WIFI_MULTICAST_STATE",
      "android.permission.NEARBY_WIFI_DEVICES",
      "android.permission.ACCESS_LOCAL_NETWORK",
      "android.permission.CAMERA",
      "android.permission.WAKE_LOCK",
      "android.permission.VIBRATE",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.SCHEDULE_EXACT_ALARM",
      "android.permission.USE_EXACT_ALARM",
    ],
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#050508",
    },
  },
  extra: {
    eas: {
      projectId: "d2d7084f-7e5a-4b67-a860-dc2eddc33241",
    },
  },
  plugins: [
    "./plugins/withAndroidNearbyFixed.ts",
    "expo-router",
    "expo-asset",
    "expo-font",
    "expo-audio",
    "expo-file-system",
    "expo-video",
    "expo-system-ui", // 🛡️ Prevents the initial white flash on boot
    [
      "expo-navigation-bar",
      {
        appearance: "dark",
        backgroundColor: "#050508",
        visibility: "hidden", // 🕵️ Hides the bar by default
        behavior: "sticky-immersive", // 🎮 Best for games; bar auto-hides after swipe
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "The app uses your camera to scan LAN room QR codes.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to let you set custom player avatars.",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png",
        color: "#A855F7",
        defaultChannel: "chor_police_general",
        enableBackgroundRemoteNotifications: false,
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          enableHermes: true,
          enableProguardInReleaseBuilds: true,
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          compiler: "r8",
          usesCleartextTraffic: true,
          extraProguardRules:
            "-keep class com.google.android.gms.nearby.** { *; }\n" +
            "-keep class com.google.firebase.** { *; }\n" +
            "-keep class expo.modules.notifications.** { *; }\n" +
            "-keep class com.dieam.reactnativepushnotification.** { *; }",
          packagingOptions: {
            pickFirst: ["**/libc++_shared.so"],
            exclude: [
              "**/LICENSE.txt",
              "**/NOTICE",
              "**/META-INF/*.py",
              "**/META-INF/*.txt",
              "**/META-INF/DEPENDENCIES",
            ],
          },
        },
      },
    ],
  ],
});
