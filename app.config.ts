import "tsx/cjs";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Chor Police",
  slug: "chorpolice",
  version: "7.5.0",
  platforms: ["android"],
  orientation: "portrait",
  scheme: "chorpolice",
  userInterfaceStyle: "dark",
  backgroundColor: "#050508",
  icon: "./assets/images/adaptive-icon.png",
  runtimeVersion: { policy: "appVersion" },
  assetBundlePatterns: ["assets/images/*", "assets/audio/*", "assets/gif/*"],
  updates: {
    url: "https://u.expo.dev/d2d7084f-7e5a-4b67-a860-dc2eddc33241",
    checkAutomatically: "NEVER",
    fallbackToCacheTimeout: 0,
  },
  android: {
    package: "com.dheeraj.chorpolice",
    userInterfaceStyle: "dark",
    allowBackup: false,
    softwareKeyboardLayoutMode: "pan",
    versionCode: 110,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    permissions: [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.ACCESS_WIFI_STATE",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.NEARBY_WIFI_DEVICES",
      "android.permission.ACCESS_LOCAL_NETWORK",
      "android.permission.CAMERA",
      "android.permission.WAKE_LOCK",
      "android.permission.VIBRATE",
      "android.permission.POST_NOTIFICATIONS",
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
      "expo-splash-screen",
      {
        backgroundColor: "#050508",
        image: "./assets/images/adaptive-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
      },
    ],
    [
      "expo-status-bar",
      {
        hidden: true,
        translucent: true,
        backgroundColor: "#050508",
        style: "light",
      },
    ],
    [
      "expo-navigation-bar",
      {
        style: "dark",
        backgroundColor: "#050508",
        hidden: true, // 🕵️ Hides the bar by default
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
          enableShrinkResourcesInReleaseBuilds: true,
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          buildToolsVersion: "36.0.0",
          compiler: "r8",
          usesCleartextTraffic: true,
          extraProguardRules:
            "-keep class com.google.android.gms.nearby.** { *; }\n" +
            "-keep class com.google.firebase.** { *; }\n" +
            "-keep class expo.modules.notifications.** { *; }\n" +
            "-keep class com.dieam.reactnativepushnotification.** { *; }\n" +
            "-dontwarn com.google.firebase.ktx.**\n" +
            "-dontwarn com.google.firebase.installations.ktx.**",
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
