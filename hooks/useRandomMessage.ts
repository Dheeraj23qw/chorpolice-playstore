import {
  WIN_MESSAGES,
  LOSS_MESSAGES,
  THINKING_MESSAGES,
  WINNER_MESSAGES,
  LOSER_MESSAGES,
  WIN_MESSAGES_WITHOUT_NAME,
  LOSS_MESSAGES_WITHOUT_NAME,
  TIMES_UP_MESSAGES_FOR_KIDS,
} from "@/constants/randomMessage";

const useRandomMessage = (
  name: string,
  status:
    | "win"
    | "lose"
    | "thinking"
    | "winner"
    | "loser"
    | "winwithoutname"
    | "loserwithoutname"
    | "timesup"
) => {
  let messages: string[] = [];

  // Set the messages based on the status
  if (status === "win") {
    messages = WIN_MESSAGES;
  } else if (status === "lose") {
    messages = LOSS_MESSAGES;
  } else if (status === "thinking") {
    messages = THINKING_MESSAGES;
  } else if (status === "winner") {
    messages = WINNER_MESSAGES;
  } else if (status === "loser") {
    messages = LOSER_MESSAGES;
  } else if (status === "winwithoutname") {
    messages = WIN_MESSAGES_WITHOUT_NAME;
  } else if (status === "loserwithoutname") {
    messages = LOSS_MESSAGES_WITHOUT_NAME;
  } else if (status === "timesup") {
    messages = TIMES_UP_MESSAGES_FOR_KIDS;
  }

  const randomIndex = Math.floor(Math.random() * messages.length);

  // Get the random message from the selected messages array
  let message = messages[randomIndex] || "";

  // Only replace {name} for certain statuses (win, lose, thinking)
  if (status === "win" || status === "lose" || status === "thinking") {
    message = message.replace("{name}", name);
  }

  return message;
};

export default useRandomMessage;
