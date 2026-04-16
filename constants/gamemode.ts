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
  gameType?: string; // Canonical game type used by lobby logic ("QUIZ", "CHOR_POLICE", etc.)
}
export const optionsGameMode: GameModeType[] = [
  {
    id: "chor_online",
    title: "CHOR POLICE",
    subtitle: "Play with your friends locally",
    difficulty: "ELITE",
    route: "/lobby" as any,
    image: require("@/assets/modalImages/intro.png"),
    accentColor: "#EF4444",
    icon: "people",
    buttonText: "CHOR POLICE",
    gameType: "CHOR_POLICE",
  },
  {
    id: "think_online",
    title: "THINK & COUNT",
    subtitle: "Compete with friends locally",
    difficulty: "SMART",
    route: "/lobby" as any,
    image: require("@/assets/images/bg/gamemode/2.png"),
    accentColor: "#6366F1",
    icon: "people",
    buttonText: "PLAY QUIZ",
    gameType: "QUIZ",
  },
];
