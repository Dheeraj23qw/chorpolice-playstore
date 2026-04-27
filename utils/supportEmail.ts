import { Platform, Linking, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";

const SUPPORT_EMAIL = "chorpolice.app@gmail.com";

interface SupportEmailProps {
  message: string;
  title?: string;
}

/**
 * Advanced Support Email Utility
 * Handles dynamic subjects, system info gathering, and copy-to-clipboard fallback.
 */
export async function sendSupportEmail({ message, title }: SupportEmailProps) {
  const appName = Constants.expoConfig?.name ?? "Chor Police";
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const buildNumber =
    Platform.OS === "ios"
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode;

  // Use the specific bug title in the subject line for better sorting in your inbox
  const subject = title ? `Bug: ${title}` : `${appName} Support Request`;

  const structuredBody = `
ISSUE TITLE: ${title || "General Support"}

DESCRIPTION:
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
