import { notificationService } from "./NotificationService";
import { NotificationTemplate } from "./templates";

function getRandomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function injectVariables(
  text: string,
  variables?: Record<string, string | number>
) {
  if (!variables) return text;

  return Object.keys(variables).reduce((acc, key) => {
    return acc.replace(
      new RegExp(`{${key}}`, "g"),
      String(variables[key])
    );
  }, text);
}

export async function scheduleFromTemplate(
  template: NotificationTemplate,
  seconds: number,
  variables?: Record<string, string | number>
) {
  const title = injectVariables(
    getRandomItem(template.titles),
    variables
  );

  const body = injectVariables(
    getRandomItem(template.bodies),
    variables
  );

  await notificationService.schedule({
    id: template.id,
    title,
    body,
    seconds,
    data: template.data,
  });
}

export async function cancelById(id: string) {
  await notificationService.cancel(id);
}
