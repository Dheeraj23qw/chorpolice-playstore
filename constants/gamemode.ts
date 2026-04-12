import { Href } from "expo-router";

export interface GameModeType {
  id: string;
  title: string;
  subtitle: string;
  difficulty: string;
  route: Href; // ✅ FIXED
  image: any;
  accentColor: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  buttonText: string;
}
export const optionsGameMode: GameModeType[] = [
  {
    id: "chor_offline",
    title: "CHOR POLICE (OFFLINE)",
    subtitle: "Find the thief before it's too late",
    difficulty: "ELITE",
    route: "/player-name",
    image: require("@/assets/modalImages/intro.png"),
    accentColor: "#EF4444",
    icon: "trophy",
    buttonText: "PLAY SOLO",
  },
  {
    id: "chor_online",
    title: "CHOR POLICE (ONLINE)",
    subtitle: "Play with your friends locally",
    difficulty: "ELITE",
    route: "/lobby" as any,
    image: require("@/assets/modalImages/intro.png"),
    accentColor: "#EF4444",
    icon: "people",
    buttonText: "HOST/JOIN",
  },
  {
    id: "think_online",
    title: "THINK & COUNT (ONLINE)",
    subtitle: "Compete with friends locally",
    difficulty: "SMART",
    route: "/lobby" as any,
    image: require("@/assets/images/bg/gamemode/2.png"),
    accentColor: "#6366F1",
    icon: "people",
    buttonText: "HOST/JOIN",
  },
];
