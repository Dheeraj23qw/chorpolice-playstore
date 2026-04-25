import { ConfigPlugin, withAndroidManifest } from "@expo/config-plugins";

const withAndroidNearbyFixed: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainManifest = config.modResults.manifest;

    if (mainManifest["uses-permission"]) {
      mainManifest["uses-permission"] = mainManifest["uses-permission"].map(
        (perm: any) => {
          if (
            perm.$["android:name"] === "android.permission.NEARBY_WIFI_DEVICES"
          ) {
            // 1. Add the flag to bypass Location requirements
            perm.$["android:usesPermissionFlags"] = "neverForLocation";

            // 2. Explicitly tell the build tools this is for API 31+
            // This prevents build-time warnings on newer Gradle versions
            perm.$["tools:targetApi"] = "31";
          }
          return perm;
        },
      );
    }

    return config;
  });
};

module.exports = withAndroidNearbyFixed; // Standard for Expo build runner
