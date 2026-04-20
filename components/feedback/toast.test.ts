import { toastStore } from "./toast";

describe("toastStore", () => {
  beforeEach(() => {
    toastStore.reset();
  });

  it("queues later toasts behind the active toast", () => {
    const firstToast = toastStore.show({
      type: "success",
      title: "First",
    });
    const secondToast = toastStore.show({
      type: "info",
      title: "Second",
    });

    const state = toastStore.getState();

    expect(state.activeToast?.id).toBe(firstToast.id);
    expect(state.queue).toHaveLength(1);
    expect(state.queue[0]?.id).toBe(secondToast.id);
  });

  it("promotes the next toast when the active toast is dismissed", () => {
    const firstToast = toastStore.show({
      type: "success",
      title: "First",
    });
    const secondToast = toastStore.show({
      type: "warning",
      title: "Second",
    });

    toastStore.dismiss(firstToast.id);

    const state = toastStore.getState();
    expect(state.activeToast?.id).toBe(secondToast.id);
    expect(state.queue).toHaveLength(0);
  });

  it("can remove a queued toast without touching the active toast", () => {
    const firstToast = toastStore.show({
      type: "success",
      title: "First",
    });
    const secondToast = toastStore.show({
      type: "error",
      title: "Second",
    });

    toastStore.dismiss(secondToast.id);

    const state = toastStore.getState();
    expect(state.activeToast?.id).toBe(firstToast.id);
    expect(state.queue).toHaveLength(0);
  });
});
