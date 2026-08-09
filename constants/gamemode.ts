import { Href } from "expo-router";

export interface GameModeType {
  id: string;
  title: string;
  subtitle: string;
  difficulty: string;
  route: Href; 
  image: any;
  accentColor: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  buttonText: string;
  gameType?: string; 
}

export const optionsGameMode: GameModeType[] = [
  {
    id: "single_player",
    title: "Single Player",
    subtitle: "Play with 3 Smart Bots",
    difficulty: "SOLO",
    route: "/offline-setup" as any,
    image: require("@/assets/images/chorsipahi/thief.webp"),
    accentColor: "#6366F1",
    icon: "person",
    buttonText: "PLAY SOLO",
  },
  {
    id: "multiplayer",
    title: "Multiplayer",
    subtitle: "Play with Friends Locally",
    difficulty: "LOCAL",
    route: "/lobby" as any,
    image: require("@/assets/images/bg/gamemode/2.webp"),
    accentColor: "#F59E0B",
    icon: "people",
    buttonText: "PLAY TOGETHER",
  },
];
