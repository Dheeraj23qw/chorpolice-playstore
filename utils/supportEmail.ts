import { Platform, Linking, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";

const SUPPORT_EMAIL = "chorpolice.app@gmail.com";

interface SupportEmailProps {
  message: string;
  title?: string;
  type?: "bug" | "suggestion";
}

/**
 * Advanced Support Email Utility
 * Handles dynamic subjects (bug report or feature suggestion), system info gathering, and copy-to-clipboard fallback.
 */
export async function sendSupportEmail({ message, title, type = "bug" }: SupportEmailProps) {
  const appName = Constants.expoConfig?.name ?? "Chor Police";
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const buildNumber =
    Platform.OS === "ios"
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode;

  const prefix = type === "suggestion" ? "💡 Suggestion" : "🐛 Bug";
  const subject = title ? `${prefix}: ${title}` : `${appName} Support Request`;

  const structuredBody = `
TYPE: ${type === "suggestion" ? "Feature Suggestion / Idea" : "Bug Report"}
TITLE: ${title || "General Feedback"}

DETAILS:
${message.trim() || "No message provided."}

-- System Info --
App: ${appName}
Version: ${appVersion} (${buildNumber ?? "N/A"})
Platform: ${Platform.OS.toUpperCase()}
Date: ${new Date().toLocaleString()}
`.trim();

  const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(structuredBody)}`;

  try {
    const supported = await Linking.canOpenURL(mailUrl);

    if (supported) {
      await Linking.openURL(mailUrl);
    } else {
      // Direct attempt fallback for Android devices that return false for canOpenURL
      await Linking.openURL(mailUrl).catch(() => showCopyAlert());
    }
  } catch (error) {
    showCopyAlert();
  }
}

const showCopyAlert = () => {
  Alert.alert(
    "Mail App Not Found",
    `We couldn't open your email app. Reach us at:\n${SUPPORT_EMAIL}`,
    [
      {
        text: "Copy Email Address",
        onPress: async () => {
          await Clipboard.setStringAsync(SUPPORT_EMAIL);
          Alert.alert(
            "Copied",
            "Support email has been copied to your clipboard.",
          );
        },
      },
      { text: "Cancel", style: "cancel" },
    ],
  );
};
