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
    image: require("@/assets/modalImages/thiefWin.png"),
    message: "Thief Wins!",
    point: "you got 500 points",
  },
  {
    id: 4,
    image: require("@/assets/modalImages/policeWin.png"),
    message: "Police Triumphs!",
    point: "you got 500 points",
  },
];
