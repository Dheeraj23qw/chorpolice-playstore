import { Platform, Linking, Alert } from "react-native";
import Constants from "expo-constants";

const SUPPORT_EMAIL = "chorpolice.app@gmail.com";

export async function sendSupportEmail(userMessage?: string) {
  try {
    // 📦 App Info
    const appName = Constants.expoConfig?.name ?? "Chor Police";
    const appVersion = Constants.expoConfig?.version ?? "1.0.0";

    const buildNumber =
      Platform.OS === "ios"
        ? Constants.expoConfig?.ios?.buildNumber
        : Constants.expoConfig?.android?.versionCode;

    const packageId =
      Platform.OS === "ios"
        ? Constants.expoConfig?.ios?.bundleIdentifier
        : Constants.expoConfig?.android?.package;

    const currentDate = new Date().toLocaleString();

    const subject = `${appName} Support Request`;

    // 📝 Structured Email Body
    const structuredBody = `
${userMessage?.trim() || "Please describe your issue here..."}

----------------------------------------
App: ${appName}
Version: ${appVersion}
Build: ${buildNumber ?? "N/A"}
Platform: ${Platform.OS}
Package ID: ${packageId ?? "N/A"}
Reported At: ${currentDate}
----------------------------------------
`.trim();

    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(structuredBody)}`;

    const supported = await Linking.canOpenURL(mailUrl);

    if (!supported) {
      Alert.alert(
        "No Email App Found",
        "Please configure a mail app on your device."
      );
      return;
    }

    await Linking.openURL(mailUrl);
  } catch (error) {
    console.error("Support Email Error:", error);

    Alert.alert(
      "Something went wrong",
      "Unable to open email app. Please try again."
    );
  }
}
