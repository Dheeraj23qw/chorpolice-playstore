import {
  getSpinReminderDelaySeconds,
  shouldPromptForNotifications,
} from "./controllerRules";

describe("shouldPromptForNotifications", () => {
  it("prompts only when the app is home, permission is missing, and no modal is open", () => {
    expect(
      shouldPromptForNotifications({
        prompted: false,
        permissionGranted: false,
        appPhase: "HOME",
        activeModal: null,
      }),
    ).toBe(true);
  });

  it("blocks prompting when a modal is already open", () => {
    expect(
      shouldPromptForNotifications({
        prompted: false,
        permissionGranted: false,
        appPhase: "HOME",
        activeModal: "REWARD_MODAL",
      }),
    ).toBe(false);
  });

  it("blocks prompting once permission has already been granted", () => {
    expect(
      shouldPromptForNotifications({
        prompted: false,
        permissionGranted: true,
        appPhase: "HOME",
        activeModal: null,
      }),
    ).toBe(false);
  });
});

describe("getSpinReminderDelaySeconds", () => {
  it("returns null when the cooldown has expired", () => {
    expect(getSpinReminderDelaySeconds(1_000, 60_000, 61_001)).toBeNull();
  });

  it("returns the rounded-up seconds remaining in the cooldown", () => {
    expect(getSpinReminderDelaySeconds(1_000, 60_000, 30_500)).toBe(31);
  });
});
