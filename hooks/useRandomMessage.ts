// useRandomMessage.ts

import { useMemo } from "react";
import { WIN_MESSAGES, LOSS_MESSAGES } from "@/constants/randomMessage";
const useRandomMessage = (name: string, status: "win" | "lose") => {
  const getMessage = useMemo(() => {
    const messages = status === "win" ? WIN_MESSAGES : LOSS_MESSAGES;
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex].replace("{name}", name);
  }, [name, status]);

  return getMessage;
};

export default useRandomMessage;
