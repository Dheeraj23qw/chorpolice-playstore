export interface NotificationPromptSnapshot {
  prompted: boolean;
  permissionGranted: boolean;
  appPhase: string;
  activeModal: string | null;
}

export function shouldPromptForNotifications({
  prompted,
  permissionGranted,
  appPhase,
  activeModal,
}: NotificationPromptSnapshot) {
  return (
    !prompted &&
    !permissionGranted &&
    appPhase === "HOME" &&
    activeModal === null
  );
}

export function getSpinReminderDelaySeconds(
  spinLastUsedTimestamp: number | null | undefined,
  cooldownMs: number,
  nowMs = Date.now(),
) {
  if (!spinLastUsedTimestamp) {
    return null;
  }

  const remainingMs = spinLastUsedTimestamp + cooldownMs - nowMs;
  if (remainingMs <= 0) {
    return null;
  }

  return Math.max(1, Math.ceil(remainingMs / 1000));
}
