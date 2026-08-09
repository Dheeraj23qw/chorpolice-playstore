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
    route: "/single-player" as any,
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
    route: "/multiplayer" as any,
    image: require("@/assets/images/bg/gamemode/2.webp"),
    accentColor: "#F59E0B",
    icon: "people",
    buttonText: "PLAY TOGETHER",
  },
];

export const singlePlayerModes: GameModeType[] = [
  {
    id: "chor_online",
    title: "CHOR POLICE",
    subtitle: "Play with your friends locally",
    difficulty: "ELITE",
    route: "/lobby" as any,
    image: require("@/assets/modalImages/intro.webp"),
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
    image: require("@/assets/images/chorsipahi/thief.webp"),
    accentColor: "#6366F1",
    icon: "people",
    buttonText: "PLAY QUIZ",
    gameType: "QUIZ",
  },
];

export const multiplayerModes: GameModeType[] = [
  ...singlePlayerModes,
  {
    id: "chor_offline",
    title: "Pass & Play",
    subtitle: "No extra phones? No worry — just pass and play with friends.",
    difficulty: "LOCAL",
    route: "/offline-setup" as any,
    image: require("@/assets/images/bg/gamemode/2.webp"),
    accentColor: "#F59E0B",
    icon: "phone-portrait-outline",
    buttonText: "PLAY LOCAL",
  },
];
