export const runAfterUI = (callback: () => void) => {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 0); // fallback (RN safe)
  }
};
