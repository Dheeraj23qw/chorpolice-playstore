import { useMemo } from "react";
import {
  WIN_MESSAGES,
  LOSS_MESSAGES,
  WINNER_MESSAGES,
  LOSER_MESSAGES,
  WIN_MESSAGES_WITHOUT_NAME,
  LOSS_MESSAGES_WITHOUT_NAME,
  TIMES_UP_MESSAGES_FOR_KIDS,
} from "@/constants/randomMessage";

type Status =
  | "win"
  | "lose"
  | "winner"
  | "loser"
  | "winwithoutname"
  | "loserwithoutname"
  | "timesup";

const MESSAGE_MAP: Record<Status, string[]> = {
  win: WIN_MESSAGES,
  lose: LOSS_MESSAGES,
  winner: WINNER_MESSAGES,
  loser: LOSER_MESSAGES,
  winwithoutname: WIN_MESSAGES_WITHOUT_NAME,
  loserwithoutname: LOSS_MESSAGES_WITHOUT_NAME,
  timesup: TIMES_UP_MESSAGES_FOR_KIDS,
};

const useRandomMessage = (status: Status, name?: string) => {
  const message = useMemo(() => {
    const messages = MESSAGE_MAP[status] ?? [];

    if (messages.length === 0) return "";

    const randomIndex = Math.floor(Math.random() * messages.length);
    let selected = messages[randomIndex];

    // Replace name only if present and needed
    if (name?.trim() && selected.includes("{name}")) {
      selected = selected.replace("{name}", name.trim());
    }

    return selected;
  }, [status, name]);

  return message;
};

export default useRandomMessage;
