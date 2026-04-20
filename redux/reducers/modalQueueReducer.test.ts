import reducer, {
  dismissActiveModal,
  enqueueModal,
} from "./modalQueueReducer";

describe("modalQueueReducer", () => {
  it("opens the first modal immediately", () => {
    const state = reducer(undefined, enqueueModal("BONUS_MODAL"));

    expect(state.activeModal).toBe("BONUS_MODAL");
    expect(state.queue).toEqual([]);
  });

  it("queues later modals while one is already active", () => {
    const firstState = reducer(undefined, enqueueModal("BONUS_MODAL"));
    const nextState = reducer(firstState, enqueueModal("LOW_COIN_MODAL"));

    expect(nextState.activeModal).toBe("BONUS_MODAL");
    expect(nextState.queue).toEqual(["LOW_COIN_MODAL"]);
  });

  it("deduplicates modals already active or queued", () => {
    const firstState = reducer(undefined, enqueueModal("BONUS_MODAL"));
    const queuedState = reducer(firstState, enqueueModal("LOW_COIN_MODAL"));
    const dedupedState = reducer(queuedState, enqueueModal("LOW_COIN_MODAL"));

    expect(dedupedState.queue).toEqual(["LOW_COIN_MODAL"]);
  });

  it("advances to the next queued modal when dismissed", () => {
    const firstState = reducer(undefined, enqueueModal("BONUS_MODAL"));
    const queuedState = reducer(firstState, enqueueModal("REWARD_MODAL"));
    const nextState = reducer(queuedState, dismissActiveModal());

    expect(nextState.activeModal).toBe("REWARD_MODAL");
    expect(nextState.queue).toEqual([]);
  });
});
