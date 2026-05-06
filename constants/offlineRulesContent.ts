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
    headerTitle: "Offline Rules",
    headerSubtitle: "",
    buttonText: "Let's Play",
    toggleText: "हिंदी",
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
    headerSubtitle: "",
    buttonText: "चलो खेलें",
    toggleText: "English",
    items: [
      {
        title: "एक Phone",
        desc: "सभी 4 खिलाड़ी एक ही phone पर साथ में खेलते हैं।",
        icon: "phone-portrait-outline",
        color: "#38bdf8",
      },
      {
        title: "Hidden Roles",
        desc: "हर round में King, Police, Chor और Advisor होते हैं।",
        icon: "person-circle-outline",
        color: "#a78bfa",
      },
      {
        title: "पहले Reveal",
        desc: "सबसे पहले King और Police public दिखते हैं।",
        icon: "eye-outline",
        color: "#facc15",
      },
      {
        title: "Police Guess",
        desc: "Police 3 mystery cards में से 1 चुनकर Chor पकड़ता है।",
        icon: "search-outline",
        color: "#22c55e",
      },
      {
        title: "Fake Joker",
        desc: "3 cards में Chor, Advisor और 1 fake Joker होता है।",
        icon: "happy-outline",
        color: "#fb7185",
      },
      {
        title: "जीत कैसे होगी",
        desc: "सही Chor पकड़ा तो Police side जीतेगी, वरना Chor side जीतती है।",
        icon: "trophy-outline",
        color: "#818cf8",
      },
    ],
  },
};
