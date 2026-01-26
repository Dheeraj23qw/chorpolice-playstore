import { Platform, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as StoreReview from "expo-store-review";
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';

const ANDROID_PACKAGE = "com.dheeraj.chorpolice";
const IOS_APP_ID = "YOUR_IOS_ID"; 

type ReviewOptions = {
  rating: number;
  comment?: string;
  onComplete?: () => void;
  onAnalytics?: (event: string, payload?: any) => void;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const handleAppReview = async ({
  rating,
  comment = "",
  onComplete,
  onAnalytics,
}: ReviewOptions) => {
  try {
    onAnalytics?.("review_started", { rating });

    // 1. Copy comment to clipboard & show a quick Toast
    if (comment.trim().length > 0) {
      try {
        await Clipboard.setStringAsync(comment.trim());
        onAnalytics?.("review_comment_copied");
        
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Copied!',
          textBody: 'Your message is ready to paste.',
        });
      } catch (err) {
        console.warn("Clipboard failed", err);
      }
    }

    // 2. Low Rating: Exit early (Internal feedback)
    if (rating < 4) {
      onAnalytics?.("review_low_rating_exit", { rating });
      
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Thank you!',
        textBody: 'We appreciate your feedback and will work to improve!',
        button: 'Close',
        onPressButton: () => {
          Dialog.hide();
          onComplete?.();
        }
      });
      return;
    }

    // 3. High Rating: Professional Dialog
    Dialog.show({
      type: ALERT_TYPE.SUCCESS, // Shows a nice green check/heart icon
      title: 'Thanks for the love! ❤️',
      textBody: 'Your review helps other players find us. Just paste your message in the store!',
      button: 'Go to Store',
      onPressButton: async () => {
        onAnalytics?.("review_store_open");
        Dialog.hide();
        await delay(300); 

        try {
          if (Platform.OS === "ios") {
            const available = await StoreReview.isAvailableAsync();
            if (available) {
              await StoreReview.requestReview();
              onAnalytics?.("review_ios_native_prompt");
            } else {
              await Linking.openURL(`https://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`);
              onAnalytics?.("review_ios_web_fallback");
            }
          } else {
            const deepLink = `market://details?id=${ANDROID_PACKAGE}&showAllReviews=true`;
            const canOpen = await Linking.canOpenURL(deepLink);
            
            if (canOpen) {
              await Linking.openURL(deepLink);
              onAnalytics?.("review_android_market");
            } else {
              await Linking.openURL(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`);
              onAnalytics?.("review_android_web_fallback");
            }
          }
        } catch (err) {
          console.warn("Redirect failed", err);
        } finally {
          onComplete?.();
        }
      },
    });

  } catch (err) {
    console.warn("Global handleAppReview error", err);
    onComplete?.();
  }
};