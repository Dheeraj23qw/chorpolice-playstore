export type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastInput extends ToastOptions {
  type: ToastType;
  title: string;
  body?: string;
}

export interface ToastPayload extends ToastInput {
  id: string;
  duration: number;
}

interface ToastState {
  activeToast: ToastPayload | null;
  queue: ToastPayload[];
}

type ToastListener = (state: ToastState) => void;

const DEFAULT_TOAST_DURATION_MS = 3200;
const INITIAL_STATE: ToastState = {
  activeToast: null,
  queue: [],
};

function normalizeDuration(duration?: number) {
  if (!duration || duration <= 0) {
    return DEFAULT_TOAST_DURATION_MS;
  }

  return Math.floor(duration);
}

function resolveToastOptions(durationOrOptions?: number | ToastOptions) {
  if (typeof durationOrOptions === "number") {
    return { duration: durationOrOptions };
  }

  return durationOrOptions ?? {};
}

class ToastStore {
  private state: ToastState = INITIAL_STATE;
  private listeners = new Set<ToastListener>();
  private sequence = 0;

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return this.state;
  }

  show(input: ToastInput) {
    const payload: ToastPayload = {
      ...input,
      id: `toast-${this.sequence + 1}`,
      duration: normalizeDuration(input.duration),
    };

    this.sequence += 1;

    if (!this.state.activeToast) {
      this.state = {
        ...this.state,
        activeToast: payload,
      };
    } else {
      this.state = {
        ...this.state,
        queue: [...this.state.queue, payload],
      };
    }

    this.emit();
    return payload;
  }

  dismiss(id?: string) {
    if (!this.state.activeToast && this.state.queue.length === 0) {
      return;
    }

    if (id && this.state.activeToast?.id !== id) {
      const nextQueue = this.state.queue.filter((toast) => toast.id !== id);
      if (nextQueue.length === this.state.queue.length) {
        return;
      }

      this.state = {
        ...this.state,
        queue: nextQueue,
      };
      this.emit();
      return;
    }

    const [nextToast, ...restQueue] = this.state.queue;
    this.state = {
      activeToast: nextToast ?? null,
      queue: restQueue,
    };
    this.emit();
  }

  clear() {
    this.state = INITIAL_STATE;
    this.emit();
  }

  reset() {
    this.sequence = 0;
    this.clear();
  }

  private emit() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const toastStore = new ToastStore();

function showToast(
  type: ToastType,
  title: string,
  body?: string,
  durationOrOptions?: number | ToastOptions,
) {
  return toastStore.show({
    type,
    title,
    body,
    ...resolveToastOptions(durationOrOptions),
  });
}

export const toast = {
  success: (
    title: string,
    body?: string,
    durationOrOptions?: number | ToastOptions,
  ) => showToast("success", title, body, durationOrOptions),
  error: (
    title: string,
    body?: string,
    durationOrOptions?: number | ToastOptions,
  ) => showToast("error", title, body, durationOrOptions),
  warning: (
    title: string,
    body?: string,
    durationOrOptions?: number | ToastOptions,
  ) => showToast("warning", title, body, durationOrOptions),
  info: (
    title: string,
    body?: string,
    durationOrOptions?: number | ToastOptions,
  ) => showToast("info", title, body, durationOrOptions),
};
