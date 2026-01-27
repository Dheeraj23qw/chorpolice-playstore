import * as Haptics from 'expo-haptics';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';

export const Alerts = {
  success: (title: string, message: string) => {
    // Light physical tap for positive feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: title,
      textBody: message,
      button: 'Awesome',
    });
  },

  error: (title: string, message: string) => {
    // Heavy physical tap for errors
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: title,
      textBody: message,
      button: 'Try Again',
    });
  },

  toast: (message: string) => {
    // Subtle selection tap for small UI updates
    Haptics.selectionAsync();
    
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Success',
      textBody: message,
    });
  }
};