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
    image: require("@/assets/images/chorsipahi/king.png"),
    message: "You are the King!",
    point: "1000 POINTS",
  },
  {
    id: 2,
    image: require("@/assets/images/chorsipahi/police.png"),
    message: "You are the Police! Find the thief.",
    point: "",
  },
  {
    id: 3,
    image: require("@/assets/modalImages/chor_win.png"),
    message: "The Thief Escaped the Trap! 🕶️",
    point: "500 POINTS",
  },
  {
    id: 4,
    image: require("@/assets/modalImages/police_win.png"),
    message: "Justice Has Been Served! 🚔",
    point: "500 POINTS",
  },
];
