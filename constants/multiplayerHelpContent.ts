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
    toggleText: "हिंदी",
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
    headerSubtitle: "बस ये steps follow करो",
    buttonText: "समझ गया",
    toggleText: "English",
    items: [
      {
        title: "Permissions Allow करें",
        desc: "App पूछे तो सभी permissions allow करें.",
        icon: "shield-checkmark",
        color: "#22c55e",
      },
      {
        title: "Mobile Data Off रखें",
        desc: "Game start करने से पहले mobile data off करें.",
        icon: "phone-portrait-outline",
        color: "#fb7185",
      },
      {
        title: "Host Hotspot On करे",
        desc: "Host अपना hotspot on रखे.",
        icon: "wifi",
        color: "#818cf8",
      },
      {
        title: "Friends Join करें",
        desc: "Friends host hotspot से connect हों.",
        icon: "people",
        color: "#38bdf8",
      },
      {
        title: "QR या Room Code",
        desc: "QR scan करें या room code enter करें.",
        icon: "qr-code",
        color: "#facc15",
      },
    ],
  },
};
