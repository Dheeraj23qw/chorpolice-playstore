export type MediaItem = {
    id: number;
    url: string | any; // URL can be a string (remote) or require (local assets)
    description: string;
  };


export const videoData: MediaItem[] = [
  {
    id: 1,
    url: "https://example.com/video1.mp4", 
    description: "Exciting Gameplay - Round 1",
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
    description: "Wrong Answer!\n you get -2000 points...",
  },
  {
    id: 2,
    url: require("@/assets/gif/quiz/laugh.gif"), 
    description: "correct Answer!\n you get +2000 points...",
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
