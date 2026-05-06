import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ModalType = "BONUS_MODAL" | "LOW_COIN_MODAL" | "REWARD_MODAL";

export interface ModalQueueState {
  queue: ModalType[];
  activeModal: ModalType | null;
}

const initialState: ModalQueueState = {
  queue: [],
  activeModal: null,
};

const modalQueueSlice = createSlice({
  name: "modalQueue",
  initialState,
  reducers: {
    enqueueModal: (state, action: PayloadAction<ModalType>) => {
      const modal = action.payload;
      const alreadyTracked =
        state.activeModal === modal || state.queue.includes(modal);

      if (alreadyTracked) return;

      if (!state.activeModal) {
        state.activeModal = modal;
        return;
      }

      state.queue.push(modal);
    },

    dismissActiveModal: (state) => {
      state.activeModal = state.queue.shift() ?? null;
    },

    resetModalQueue: () => initialState,
  },
});

export const { enqueueModal, dismissActiveModal } = modalQueueSlice.actions;
export default modalQueueSlice.reducer;
