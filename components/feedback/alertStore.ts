import { AlertPayload } from "./types";

let listener: ((data: AlertPayload) => void) | null = null;

export const alertStore = {
  subscribe: (cb: (data: AlertPayload) => void) => {
    listener = cb;
  },

  show: (data: AlertPayload) => {
    listener?.(data);
  },
};
