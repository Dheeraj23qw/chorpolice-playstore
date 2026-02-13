import { scheduleFromTemplate, cancelById } from "./scheduler";
import { SPIN_TEMPLATE } from "./templates";

export function scheduleSpinUnlock(seconds: number) {
  return scheduleFromTemplate(SPIN_TEMPLATE, seconds);
}

export function cancelSpinNotification() {
  return cancelById(SPIN_TEMPLATE.id);
}
