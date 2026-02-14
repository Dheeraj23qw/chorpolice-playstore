import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';

export const Alerts = {
  success: (title: string, message: string) => {
    // Light physical tap for positive feedback
    
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: title,
      textBody: message,
      button: 'Awesome',
    });
  },

  error: (title: string, message: string) => {
    // Heavy physical tap for errors
    
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: title,
      textBody: message,
      button: 'Try Again',
    });
  },

  toast: (message: string) => {
    // Subtle selection tap for small UI updates
    
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Success',
      textBody: message,
    });
  }
};