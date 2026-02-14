import { Platform, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as StoreReview from "expo-store-review";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";

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
   
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Thanks for your feedback 💛",
        textBody:
          "We appreciate your honesty. We'll work hard to improve your experience!",
        button: "Close",
        onPressButton: () => {
          Dialog.hide();
          onComplete?.();
        },
      });

      return;
    }

    /* ---------------------------------- */
    /* 3️⃣ High Rating Flow (4–5 Stars)   */
    /* ---------------------------------- */
 
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: "Thanks for the love! ❤️",
      textBody:
        "Your review helps other players find us. Just paste your message in the store!",
      button: "Go to Store",
      onPressButton: async () => {
        Dialog.hide();
        await delay(300);

        try {
          if (Platform.OS === "ios") {
            const available = await StoreReview.isAvailableAsync();

            if (available) {
              await StoreReview.requestReview();
            } else {
              await Linking.openURL(
                `https://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`
              );
            }
          } else {
            // Direct open review page instead of details page
            const deepLink = `market://details?id=${ANDROID_PACKAGE}&showAllReviews=true`;

            const canOpen = await Linking.canOpenURL(deepLink);

            if (canOpen) {
              await Linking.openURL(deepLink);
            } else {
              await Linking.openURL(
                `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`
              );
            }
          }
        } catch (err) {
          console.warn("Store redirect failed:", err);
        } finally {
          onComplete?.();
        }
      },
    });
  } catch (err) {
    console.warn("Global handleAppReview error:", err);
    onComplete?.();
  }
};
