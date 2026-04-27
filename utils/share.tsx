import * as Application from "expo-application"; 
import { Share } from "react-native";

export const handleShare = async (referralCode?: string) => {
  try {
    const androidPackageName = "com.dheeraj.chorpolice"; 
    const appStoreLink = `https://play.google.com/store/apps/details?id=${androidPackageName}`;

    // Get app metadata
    const appName = Application.applicationName;

    let message = `Check out this awesome app, ${appName}! A Modern twist of classical childhood game Raja Mantri Chor Sipahi\nDownload it now: ${appStoreLink}\n`;

    if (referralCode) {
      message += `\nUse my referral code: ${referralCode} to get 10,000 bonus coins! 🎁`;
    }

    await Share.share({
      message: message,
    });
  } catch (error) {
    console.error("Error sharing app", error);
  }
};
