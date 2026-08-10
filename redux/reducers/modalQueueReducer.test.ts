import reducer, {
  dismissActiveModal,
  enqueueModal,
  ModalQueueState,
} from "./modalQueueReducer";

describe("modalQueueReducer", () => {
  /* ---------------- INITIAL ---------------- */

  it("returns initial state", () => {
    const state = reducer(undefined, { type: "unknown" });

    expect(state).toEqual<ModalQueueState>({
      activeModal: null,
      queue: [],
    });
  });

  /* ---------------- ENQUEUE ---------------- */

  it("opens the first modal immediately", () => {
    const state = reducer(undefined, enqueueModal("LOW_COIN_MODAL"));

    expect(state.activeModal).toBe("LOW_COIN_MODAL");
    expect(state.queue).toEqual([]);
  });

  it("queues later modals while one is already active", () => {
    const state1 = reducer(undefined, enqueueModal("LOW_COIN_MODAL"));
    const state2 = reducer(state1, enqueueModal("REWARD_MODAL"));

    expect(state2.activeModal).toBe("LOW_COIN_MODAL");
    expect(state2.queue).toEqual(["REWARD_MODAL"]);
  });

  it("deduplicates modals already active or queued", () => {
    const state1 = reducer(undefined, enqueueModal("LOW_COIN_MODAL"));
    const state2 = reducer(state1, enqueueModal("REWARD_MODAL"));
    const state3 = reducer(state2, enqueueModal("REWARD_MODAL"));

    expect(state3.queue).toEqual(["REWARD_MODAL"]);
    expect(state3.activeModal).toBe("LOW_COIN_MODAL");
  });

  /* ---------------- DISMISS ---------------- */

  it("advances to the next queued modal when dismissed", () => {
    const state1 = reducer(undefined, enqueueModal("LOW_COIN_MODAL"));
    const state2 = reducer(state1, enqueueModal("REWARD_MODAL"));
    const state3 = reducer(state2, dismissActiveModal());

    expect(state3.activeModal).toBe("REWARD_MODAL");
    expect(state3.queue).toEqual([]);
  });

  it("clears activeModal if queue is empty on dismiss", () => {
    const state1 = reducer(undefined, enqueueModal("LOW_COIN_MODAL"));
    const state2 = reducer(state1, dismissActiveModal());

    expect(state2.activeModal).toBeNull();
    expect(state2.queue).toEqual([]);
  });
});
