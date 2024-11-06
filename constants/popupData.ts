// data.ts
import { ImageSourcePropType } from 'react-native';

export interface DataItem {
  id: number;
  image: ImageSourcePropType;
  message: string;
  point: string;
  message1: string[];
}

export const data: DataItem[] = [
  {
    id: 1,
    image: require("@/assets/modalImages/king.png"),
    message: "Hail the King!",
    point: "you got 1000 points",
    message1: [
      "Congrats, King! 👑",
      "King for the win!",
      "The King reigns supreme!",
      "The King is the boss!",
      "Hail the mighty King!",
      "The King is victorious!",
      "All hail our King!",
      "King’s victory is sweet!",
      "Long live the King!",
      "The King shines bright!",
    ],
  },
  {
    id: 2,
    image: require("@/assets/modalImages/police.png"),
    message: "Police Alert!",
    point: "",
    message1: [
      "Catch that Thief! 🚔",
      "Police on the case!",
      "Stop the Thief!",
      "Time to catch the Thief! 🔍",
      "Catch the Thief and save the day!",
      "Police are chasing!",
      "Police are coming for the Thief!",
      "On the lookout for the Thief!",
      "Thief can’t escape!",
      "Police on the trail!",
    ],
  },
  {
    id: 3,
    image: require("@/assets/modalImages/advisor.png"),
    message: "Advisor at your service!",
    point: "you got 800 points",
    message1: [
      "Congrats, you’re the Advisor! 🧠",
      "You’re the Advisor this round, great choice!",
      "Well done! You’re the Advisor!",
      "Awesome, you’re the Advisor this time!",
      "You’ve been chosen as the Advisor, great job!",
      "Hooray, you’re the Advisor!",
      "Congrats on being the Advisor!",
      "You’re the Advisor now, well done!",
      "Great choice, you’re the Advisor!",
      "Way to go, you’re the Advisor!",
    ],
  },
  {
    id: 4,
    image: require("@/assets/modalImages/thiefWin.png"),
    message: "Thief Wins!",
    point: "you got 500 points",
    message1: [
      "You got lucky, Thief wins! 🍀",
      "Lucky you, the Thief escapes!",
      "The Thief wins by luck! 🎉",
      "Great luck, you made it!",
      "Wow, the Thief got away!",
      "You’re lucky today, Thief!",
      "The Thief wins, good job!",
      "Lucky Thief, well done!",
      "You did it, lucky escape!",
      "The cards were on your side!",
    ],
  },
  {
    id: 5,
    image: require("@/assets/modalImages/policeWin.png"),
    message: "Police Triumphs!",
    point: "you got 500 points",
    message1: [
      "You did it, Police win! 🚔",
      "Great job, you caught the Thief!",
      "The Police save the day!",
      "Awesome! The Thief is caught!",
      "Well done, Police hero!",
      "Police win, great work!",
      "You caught the Thief, nice job!",
      "The Police win, you’re the hero!",
      "Amazing, the Thief is stopped!",
      "You did great, Police win!",
    ],
  },
];
