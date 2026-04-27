import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * What action popup should trigger
 */
type PopupActionKey =
  | "EXIT_GAME"
  | "RESET_MATCH"
  | "LOGOUT"
  | "NAVIGATE"
  | "CUSTOM"
  | "NONE";

/**
 * Popup visual type
 */
type PopupVariant =
  | "confirm"
  | "alert"
  | "info"
  | "destructive";

/**
 * Serializable payload for actions
 */
type PopupPayload = Record<string, any> | null;

/**
 * Popup configuration
 */
type PopupConfig = {
  id?: string;                      // useful for analytics
  title?: string;
  message: string;

  confirmText?: string;
  cancelText?: string;

  variant?: PopupVariant;

  action?: PopupActionKey;
  payload?: PopupPayload;

  autoCloseMs?: number;             // auto dismiss timer
  dismissible?: boolean;            // tap outside closes
};

/**
 * Popup State
 */
interface PopupState {
  visible: boolean;
  config: PopupConfig | null;
}

const initialState: PopupState = {
  visible: false,
  config: null,
};

const popupSlice = createSlice({
  name: "popup",
  initialState,
  reducers: {
    showPopup: (state, action: PayloadAction<PopupConfig>) => {
      state.visible = true;
      state.config = {
        variant: "confirm",
        dismissible: true,
        ...action.payload,
      };
    },

    hidePopup: (state) => {
      state.visible = false;
      state.config = null;
    },

    updatePopup: (state, action: PayloadAction<Partial<PopupConfig>>) => {
      if (!state.config) return;
      state.config = { ...state.config, ...action.payload };
    },
  },
});

const { showPopup, hidePopup } = popupSlice.actions;
export default popupSlice.reducer;
