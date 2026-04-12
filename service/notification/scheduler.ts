import { notificationService } from "./NotificationService";
import { NotificationTemplate } from "./types";

function getRandomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function injectVariables(
  text: string,
  variables?: Record<string, string | number>
) {
  if (!variables) return text;
  return Object.keys(variables).reduce((acc, key) => {
    return acc.replace(new RegExp(`{${key}}`, "g"), String(variables[key]));
  }, text);
}

/**
 * Schedules a notification from a template with optional variable substitution.
 * @param template    - The notification template to use
 * @param seconds     - How many seconds from now to fire
 * @param variables   - Optional key/value substitutions for {placeholders}
 * @param color       - Optional accent color for the notification
 * @param channelId   - Android channel ID: "default" or "alerts" (default: "default")
 */
export async function scheduleFromTemplate(
  template: NotificationTemplate,
  seconds: number,
  variables?: Record<string, string | number>,
  color?: string,
  channelId: "default" | "alerts" = "default"
) {
  const title = injectVariables(getRandomItem(template.titles), variables);
  const body = injectVariables(getRandomItem(template.bodies), variables);

  await notificationService.schedule({
    id: template.id,
    title,
    body,
    seconds,
    color,
    channelId,
    data: template.data,
  });
}

export async function cancelById(id: string) {
  await notificationService.cancel(id);
}
