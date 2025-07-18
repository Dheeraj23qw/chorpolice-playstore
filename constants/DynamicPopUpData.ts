export type MediaItem = {
  id: number;
  url: string; // URL can be a string (remote) or require (local assets)
  description: string;
};

import useRandomMessage from "@/hooks/useRandomMessage";

const random = useRandomMessage("", "winwithoutname");

export const videoData: MediaItem[] = [
  {
    id: 1,
    url: require("@/assets/gif/chorPolicescreen/chorpolice.mp4"),
    description: "Thinking... give me a second!",
  },
  {
    id: 2,
    url: require("@/assets/gif/chorPolicescreen/chorpolice.mp4"),
    description: "Winning Moment - Final Round",
  },
];

// GIF data (with IDs and URLs)
export const gifData: MediaItem[] = [
  {
    id: 1,
    url: require("@/assets/gif/quiz/weep.gif"),
    description: "- 2000 points.",
  },
  {
    id: 2,
    url: require("@/assets/gif/quiz/laugh.gif"),
    description: "+ 2000 points!",
  },

  {
    id: 3,
    url: require("@/assets/gif/quiz/weep.gif"),
    description: "you got 0 points.",
  },
  {
    id: 4,
    url: require("@/assets/gif/quiz/laugh.gif"),
    description: "you got 500 points!",
  },
  {
    id: 5,
    url: require("@/assets/gif/quiz/bot.gif"),
    description: "please wait...",
  },
  {
    id: 6,
    url: require("@/assets/gif/quiz/weep.gif"),
    description: "Wrong answer!",
  },
  {
    id: 7,
    url: require("@/assets/gif/quiz/laugh.gif"),
    description: "Correct answer!",
  },
  {
    id: 8,
    url: require("@/assets/gif/quiz/timesup.gif"),
    description: "Time's Up",
  },
  {
    id: 9,
    url: require("@/assets/gif/quiz/chest.gif"),
    description: "Win 100 Coins!\n Answer 7/7 Correctly.",
  },

  {
    id: 10,
    url: require("@/assets/gif/quiz/chest.gif"),
    description: "Win 500 Coins!\n Answer 7/7 Correctly.",
  },
  {
    id: 11,
    url: require("@/assets/gif/quiz/chest.gif"),
    description: "Win 2000 Coins! \n Answer 7/7 Correctly.",
  },
  {
    id: 12,
    url: require("@/assets/gif/quiz/chest.gif"),
    description: "Your treasure sparkles with victory!",
  },

];

// Image data (with IDs and URLs)
export const imageData: MediaItem[] = [
  {
    id: 1,
    url: require("@/assets/modalImages/king.png"),
    description: "Great job! You earned points!",
  },
  {
    id: 2,
    url: require("@/assets/modalImages/king.png"),
    description: "Well done! Keep it up!",
  },
];
