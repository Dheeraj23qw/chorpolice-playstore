import { Platform, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as StoreReview from "expo-store-review";
import * as Haptics from "expo-haptics"; // 1. Import Haptics
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';

const ANDROID_PACKAGE = "com.dheeraj.chorpolice";
const IOS_APP_ID = "YOUR_IOS_ID"; 

type ReviewOptions = {
  rating: number;
  comment?: string;
  onComplete?: () => void;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const handleAppReview = async ({
  rating,
  comment = "",
  onComplete,
}: ReviewOptions) => {
  try {
    if (comment.trim().length > 0) {
      try {
        await Clipboard.setStringAsync(comment.trim());
        Haptics.selectionAsync(); 
      } catch (err) {
        console.warn("Clipboard failed", err);
      }
    }

    if (rating < 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

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

 
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Thanks for the love! ❤️',
      textBody: 'Your review helps other players find us. Just paste your message in the store!',
      button: 'Go to Store',
      onPressButton: async () => {
        Dialog.hide();
        await delay(300); 

        try {
          if (Platform.OS === "ios") {
            const available = await StoreReview.isAvailableAsync();
            if (available) {
              await StoreReview.requestReview();
            } else {
              await Linking.openURL(`https://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`);
            }
          } else {
            const deepLink = `market://details?id=${ANDROID_PACKAGE}&showAllReviews=true`;
            const canOpen = await Linking.canOpenURL(deepLink);
            
            if (canOpen) {
              await Linking.openURL(deepLink);
            } else {
              await Linking.openURL(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`);
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