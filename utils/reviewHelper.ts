import { Platform, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as StoreReview from "expo-store-review";
import { toast } from "@/components/feedback/toast";

const ANDROID_PACKAGE = "com.dheeraj.chorpolice";
const IOS_APP_ID = "YOUR_IOS_ID";

type ReviewOptions = {
  rating: number;
  comment?: string;
  onComplete?: () => void;
};

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const handleAppReview = async ({
  rating,
  comment = "",
  onComplete,
}: ReviewOptions) => {
  try {
    /* ---------------------------------- */
    /* 1️⃣ Copy Comment (If Exists)       */
    /* ---------------------------------- */
    if (comment.trim().length > 0) {
      try {
        await Clipboard.setStringAsync(comment.trim());
      } catch (err) {
        console.warn("Clipboard failed:", err);
      }
    }

    /* ---------------------------------- */
    /* 2️⃣ Low Rating Flow (<4)           */
    /* ---------------------------------- */
    if (rating < 4) {
      toast.warning("Thanks for your feedback 💛", "We appreciate your honesty. We'll work hard to improve your experience!");
      onComplete?.();
      return;
    }

    /* ---------------------------------- */
    /* 3️⃣ High Rating Flow (4–5 Stars)   */
    /* ---------------------------------- */
  
    toast.success("Thanks for the love! ❤️", "Your review helps other players find us. Redirecting to store...");
    await delay(800);

    let opened = false;
    try {
      if (Platform.OS === "ios") {
        const available = await StoreReview.isAvailableAsync();
        if (available) {
          await StoreReview.requestReview();
          opened = true;
        } else {
          const url = `https://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            opened = true;
          }
        }
      } else {
        const deepLink = `market://details?id=${ANDROID_PACKAGE}&showAllReviews=true`;
        const canOpen = await Linking.canOpenURL(deepLink);
        if (canOpen) {
          await Linking.openURL(deepLink);
          opened = true;
        } else {
          const url = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
          const canOpenWeb = await Linking.canOpenURL(url);
          if (canOpenWeb) {
            await Linking.openURL(url);
            opened = true;
          }
        }
      }
    } catch (err) {
      console.warn("Store redirect failed:", err);
    }

    if (opened) {
      onComplete?.();
    }
  } catch (err) {
    console.warn("Global handleAppReview error:", err);
  }
};
