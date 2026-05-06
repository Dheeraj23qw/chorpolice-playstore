import { Ionicons } from "@expo/vector-icons";

export type OfflineRulesLanguage = "EN" | "HI";

export interface OfflineRulesItem {
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export interface OfflineRulesContent {
  headerTitle: string;
  headerSubtitle: string;
  buttonText: string;
  toggleText: string;
  items: OfflineRulesItem[];
}

export const OFFLINE_RULES_CONTENT: Record<
  OfflineRulesLanguage,
  OfflineRulesContent
> = {
  EN: {
    headerTitle: "Game Rules",
    headerSubtitle: "",
    buttonText: "Let's Play",
    toggleText: "Hinglish",
    items: [
      {
        title: "One Phone",
        desc: "All 4 players play together on the same phone.",
        icon: "phone-portrait-outline",
        color: "#38bdf8",
      },
      {
        title: "Hidden Roles",
        desc: "Each round has 1 King, 1 Police, 1 Thief, and 1 Advisor.",
        icon: "person-circle-outline",
        color: "#a78bfa",
      },
      {
        title: "Public Reveal",
        desc: "King and Police open first so everyone knows the setup.",
        icon: "eye-outline",
        color: "#facc15",
      },
      {
        title: "Police Guess",
        desc: "Police picks 1 mystery card to catch the Thief.",
        icon: "search-outline",
        color: "#22c55e",
      },
      {
        title: "Fake Joker",
        desc: "The 3 cards are Thief, Advisor, and 1 fake Joker.",
        icon: "happy-outline",
        color: "#fb7185",
      },
      {
        title: "Win Rule",
        desc: "Catch the Thief to win. Wrong guess lets the Thief side win.",
        icon: "trophy-outline",
        color: "#818cf8",
      },
    ],
  },
  HI: {
    headerTitle: "Offline Rules",
    headerSubtitle: "1 phone pe sab saath khelo",
    buttonText: "Chalo Khelein",
    toggleText: "English",
    items: [
      {
        title: "One Phone",
        desc: "Saare 4 players ek hi phone par saath me khelte hain.",
        icon: "phone-portrait-outline",
        color: "#38bdf8",
      },
      {
        title: "Hidden Roles",
        desc: "Har round me King, Police, Chor aur Advisor roles hote hain.",
        icon: "person-circle-outline",
        color: "#a78bfa",
      },
      {
        title: "Pehle Reveal",
        desc: "Sabse pehle King aur Police sabko dikhte hain, taaki setup clear ho.",
        icon: "eye-outline",
        color: "#facc15",
      },
      {
        title: "Police Guess",
        desc: "Police 3 mystery cards me se 1 card choose karke Chor pakadne ki koshish karta hai.",
        icon: "search-outline",
        color: "#22c55e",
      },
      {
        title: "Fake Joker",
        desc: "3 cards me Chor, Advisor aur 1 fake Joker hota hai.",
        icon: "happy-outline",
        color: "#fb7185",
      },
      {
        title: "Win Rule",
        desc: "Agar Police sahi Chor pakad le to Police side jeetegi, warna Chor side jeet jayegi.",
        icon: "trophy-outline",
        color: "#818cf8",
      },
    ],
  },
};
