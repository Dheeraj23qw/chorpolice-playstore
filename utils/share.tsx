import * as Application from "expo-application"; // Import the expo-application package
import { Share } from "react-native";

export const handleShare = async () => {
  try {
    const androidPackageName = "com.dheeraj_kumar_yadav.chorpolice"; // Replace with your app's package name
    const appStoreLink = `https://play.google.com/store/apps/details?id=${androidPackageName}`;

    // Get app metadata
    const appName = Application.applicationName;

    // Your uploaded app icon URL
    const appIconUrl =
      "https://cdn-icons-png.flaticon.com/512/3616/3616049.png"; // Replace with the URL of your app icon

    const message = `Check out this awesome app, ${appName}! \nDownload it now: ${appStoreLink}\n`;

    await Share.share({
      message: message,
    });
  } catch (error) {
    console.error("Error sharing app", error);
  }
};
