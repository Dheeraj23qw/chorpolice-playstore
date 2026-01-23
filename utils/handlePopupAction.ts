import { router } from "expo-router";
import store from "@/redux/store";

export type PopupActionParams = {
  action?: string;
  payload?: Record<string, any> | null;
};

export function handlePopupAction({
  action,
  payload,
}: PopupActionParams) {
  switch (action) {
    case "EXIT_GAME":
      router.back();
      break;

    case "RESET_MATCH":
      store.dispatch({ type: "game/reset" });
      break;

    case "LOGOUT":
      store.dispatch({ type: "auth/logout" });
      break;

    case "NAVIGATE":
      if (payload?.route) {
        router.push(payload.route);
      }
      break;

    case "CUSTOM":
      payload?.callback?.();
      break;

    default:
      break;
  }
}
