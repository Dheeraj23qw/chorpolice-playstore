import { toast } from "@/components/feedback/toast";

/**
 * Unified Alerts utility — now powered by the custom toast system.
 * Drop-in replacement for the old react-native-alert-notification wrapper.
 */
export const Alerts = {
  success: (title: string, message: string) => {
    toast.success(title, message);
  },

  error: (title: string, message: string) => {
    toast.error(title, message);
  },

  toast: (message: string) => {
    toast.success("Success", message);
  },
};