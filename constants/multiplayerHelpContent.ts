import { Ionicons } from "@expo/vector-icons";

export type HelpLanguage = "EN" | "HI";

export interface MultiplayerHelpItem {
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export interface MultiplayerHelpContent {
  headerTitle: string;
  headerSubtitle: string;
  buttonText: string;
  toggleText: string;
  items: MultiplayerHelpItem[];
}

export const MULTIPLAYER_HELP_CONTENT: Record<
  HelpLanguage,
  MultiplayerHelpContent
> = {
  EN: {
    headerTitle: "Play Chor Police",
    headerSubtitle: "Allow permissions and follow these steps",
    buttonText: "Ready",
    toggleText: "Hinglish",
    items: [
      {
        title: "Allow Permissions",
        desc: "Give all permissions when asked.",
        icon: "shield-checkmark",
        color: "#22c55e",
      },
      {
        title: "Mobile Data Off",
        desc: "Turn OFF mobile data first.",
        icon: "phone-portrait-outline",
        color: "#fb7185",
      },
      {
        title: "Host Hotspot",
        desc: "Host turns hotspot ON.",
        icon: "wifi",
        color: "#818cf8",
      },
      {
        title: "Friends Join",
        desc: "Friends connect to host hotspot.",
        icon: "people",
        color: "#38bdf8",
      },
      {
        title: "Scan or Code",
        desc: "Join using QR or room code.",
        icon: "qr-code",
        color: "#facc15",
      },
    ],
  },
  HI: {
    headerTitle: "Play Chor Police",
    headerSubtitle: "Bas ye simple steps follow karo",
    buttonText: "Samajh Gaya",
    toggleText: "English",
    items: [
      {
        title: "Permissions Allow Karo",
        desc: "App jab permission maange, sab allow kar do.",
        icon: "shield-checkmark",
        color: "#22c55e",
      },
      {
        title: "Mobile Data Off",
        desc: "Game start karne se pehle mobile data off rakho.",
        icon: "phone-portrait-outline",
        color: "#fb7185",
      },
      {
        title: "Host Hotspot On",
        desc: "Host apna hotspot on rakhe.",
        icon: "wifi",
        color: "#818cf8",
      },
      {
        title: "Friends Join Karein",
        desc: "Friends host ke hotspot se connect ho jayein.",
        icon: "people",
        color: "#38bdf8",
      },
      {
        title: "QR Ya Room Code",
        desc: "QR scan karo ya room code enter karo.",
        icon: "qr-code",
        color: "#facc15",
      },
    ],
  },
};
