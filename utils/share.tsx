import * as Application from "expo-application"; 
import { Share } from "react-native";

export const handleShare = async () => {
  try {
    const androidPackageName = "com.dheeraj.chorpolice"; 
    const appStoreLink = `https://play.google.com/store/apps/details?id=${androidPackageName}`;

    // Get app metadata
    const appName = Application.applicationName;

    const message = `Check out this awesome app, ${appName}! A Modern twist of classical childhood game Raja Mantri Chor Sipahi\nDownload it now: ${appStoreLink}\n`;

    await Share.share({
      message: message,
      
    });
  } catch (error) {
    console.error("Error sharing app", error);
  }
};
