import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

/**
 * Using nanoid is preferred over Date.now() for unique IDs 
 * to avoid collisions during rapid-fire dispatches.
 */

export type AlertType = "success" | "error" | "warning" | "info";

export interface Alert {
  id: string;
  type: AlertType;
  title?: string; // Modern apps use titles + descriptions
  message: string;
  duration: number; // Required in state for the UI to know its lifespan
  onPress?: () => void;
  createdAt: number;
}

interface AlertsState {
  alerts: Alert[];
}

const initialState: AlertsState = {
  alerts: [],
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    // We use a "Prepare" callback to handle ID generation and defaults 
    // outside of the reducer (keeping the reducer pure).
    showAlert: {
      reducer: (state, action: PayloadAction<Alert>) => {
        // Limit total alerts to 3 to prevent UI clutter
        if (state.alerts.length >= 3) {
          state.alerts.shift(); 
        }
        state.alerts.push(action.payload);
      },
      prepare: (payload: Omit<Alert, "id" | "createdAt" | "duration"> & { duration?: number }) => {
        return {
          payload: {
            ...payload,
            id: nanoid(),
            createdAt: Date.now(),
            duration: payload.duration ?? 4000, // Default 4s
          },
        };
      },
    },
    dismissAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter((alert) => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const { showAlert, dismissAlert, clearAlerts } = alertsSlice.actions;
export default alertsSlice.reducer;