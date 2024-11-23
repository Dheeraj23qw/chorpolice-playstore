// data.ts
import { ImageSourcePropType } from "react-native";

export interface DataItem {
  id: number;
  image: ImageSourcePropType;
  message: string;
  point: string;
  
}

export const data: DataItem[] = [
  {
    id: 1,
    image: require("@/assets/modalImages/king.png"),
    message: "Hail the King!",
    point: "you got 1000 points",
  },
  {
    id: 2,
    image: require("@/assets/modalImages/police.png"),
    message: "Police Alert!",
    point: "",
  },

  {
    id: 3,
    image: require("@/assets/modalImages/coin.png"),
    message: "You chose the easy level!",
    point: "Answer 5 out of 7 correctly to earn 100 coins!",
  },

  {
    id: 4,
    image: require("@/assets/modalImages/coin.png"),
    message: "You chose the medium level!",
    point: "Answer 5 out of 7 correctly to earn 500 coins!",
  },

  {
    id: 5,
    image: require("@/assets/modalImages/coin.png"),
    message: "You chose the hard level!",
    point: "Answer 5 out of 7 correctly to earn 2000 coins!",
  },
 
];
