import * as Analytics from 'expo-firebase-analytics';

export const logGameEvent = async (eventName: string, params: object = {}) => {
  try {
   if (Constants.appOwnership !== 'expo') {
    await Analytics.logEvent(name, params);
  }
  } catch (e) {
    console.warn("Analytics Error:", e);
  }
};