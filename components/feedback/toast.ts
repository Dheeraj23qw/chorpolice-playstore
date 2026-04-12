/**
 * --- CUSTOM TOAST SYSTEM ---
 * Replaces react-native-alert-notification Toast and the old GlobalAlert.
 * Single import, zero dependencies, premium aesthetic.
 *
 * Usage anywhere:
 *   import { toast } from "@/components/feedback/toast";
 *   toast.success("Title", "Body message");
 *   toast.error("Title", "Body message");
 *   toast.warning("Title", "Body message");
 *   toast.info("Title", "Body message");
 */

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastPayload {
  type: ToastType;
  title: string;
  body?: string;
  duration?: number;
}

type ToastListener = (data: ToastPayload) => void;

let _listener: ToastListener | null = null;

/** Internal store — the ToastProvider subscribes to this. */
export const toastStore = {
  subscribe: (cb: ToastListener) => {
    _listener = cb;
  },

  fire: (data: ToastPayload) => {
    _listener?.(data);
  },
};

/**
 * Public API — call from anywhere, no hooks needed.
 */
export const toast = {
  success: (title: string, body?: string, duration?: number) =>
    toastStore.fire({ type: "success", title, body, duration }),

  error: (title: string, body?: string, duration?: number) =>
    toastStore.fire({ type: "error", title, body, duration }),

  warning: (title: string, body?: string, duration?: number) =>
    toastStore.fire({ type: "warning", title, body, duration }),

  info: (title: string, body?: string, duration?: number) =>
    toastStore.fire({ type: "info", title, body, duration }),
};
