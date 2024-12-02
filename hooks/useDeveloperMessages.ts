// useDeveloperMessages.ts
import { useState, useEffect } from "react";
import { DEVELOPER_MESSAGES } from "@/constants/DevdloperMsg";
export const useDeveloperMessages = () => {
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [messageIndex, setMessageIndex] = useState<number>(0);
  const [selectedMessage, setSelectedMessage] = useState<string[]>(
    DEVELOPER_MESSAGES[Math.floor(Math.random() * DEVELOPER_MESSAGES.length)]
  ); // Select a random message

  useEffect(() => {
    const interval = setInterval(() => {
      if (messageIndex < selectedMessage.length) {
        setCurrentMessage(selectedMessage[messageIndex]);
        setMessageIndex((prevIndex) => prevIndex + 1);
      } else {
        // Reset to show a new random message after completing the current one
        setMessageIndex(0);
        setSelectedMessage(
          DEVELOPER_MESSAGES[
            Math.floor(Math.random() * DEVELOPER_MESSAGES.length)
          ]
        ); // Select a new random message
      }
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [messageIndex, selectedMessage]);

  return currentMessage;
};
