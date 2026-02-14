import { Href } from "expo-router";

export interface GameModeType {
  id: string;
  title: string;
  subtitle: string;
  difficulty: string;
  route: Href;   // ✅ FIXED
  image: any;
  accentColor: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  buttonText: string;
}
export const optionsGameMode: GameModeType[] = [
  {
    id: "think",
    title: "Think & Count",
    subtitle: "Train your brain with smart calculations",
    difficulty: "SMART",
    route: "/level-select",
    image: require("@/assets/images/bg/gamemode/1.png"),
    accentColor: "#6366F1",
    icon: "infinite",
    buttonText: "Start Thinking",
  },
  {
    id: "chor",
    title: "Chor Police",
    subtitle: "Find the thief before it's too late",
    difficulty: "ELITE",
    route: "/player-name",
    image: require("@/assets/images/bg/gamemode/2.png"),
    accentColor: "#EF4444",
    icon: "trophy",
    buttonText: "Catch Now",
  },
];
