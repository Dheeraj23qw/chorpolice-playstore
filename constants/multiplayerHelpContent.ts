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
    headerTitle: "How to Join a Game",
    headerSubtitle: "Follow these steps to connect & play",
    buttonText: "Got It!",
    toggleText: "Hinglish",
    items: [
      {
        title: "Step 1 — Turn OFF Mobile Data",
        desc: "Go to Settings and turn OFF your mobile data before anything else.",
        icon: "cellular-outline",
        color: "#fb7185",
      },
      {
        title: "Step 2 — Connect to Host Wi-Fi",
        desc: "Open Wi-Fi settings and connect to the host's hotspot network.",
        icon: "wifi",
        color: "#22c55e",
      },
      {
        title: "Step 3 — Allow All Permissions",
        desc: "When the app asks for permissions (Location, Nearby Devices), tap Allow on everything.",
        icon: "shield-checkmark",
        color: "#818cf8",
      },
      {
        title: "Step 4 — Scan the QR Code",
        desc: "Point your camera at the host's QR code. It will auto-join the room.",
        icon: "qr-code",
        color: "#38bdf8",
      },
      {
        title: "Step 5 — Wait for Host",
        desc: "Once joined, wait for the host to start the match. Don't disconnect from Wi-Fi!",
        icon: "time-outline",
        color: "#facc15",
      },
      {
        title: "Not Connecting?",
        desc: "Make sure mobile data is OFF, you're on the host's Wi-Fi, and both phones are close to each other.",
        icon: "alert-circle-outline",
        color: "#f97316",
      },
    ],
  },
  HI: {
    headerTitle: "Game Mein Kaise Join Karein",
    headerSubtitle: "Ye steps follow karo connect hone ke liye",
    buttonText: "Samajh Gaya!",
    toggleText: "English",
    items: [
      {
        title: "Step 1 — Mobile Data OFF Karo",
        desc: "Settings mein jaake mobile data OFF kar do, sabse pehle.",
        icon: "cellular-outline",
        color: "#fb7185",
      },
      {
        title: "Step 2 — Host Ka Wi-Fi Connect Karo",
        desc: "Wi-Fi settings kholo aur host ke hotspot network se connect ho jao.",
        icon: "wifi",
        color: "#22c55e",
      },
      {
        title: "Step 3 — Sab Permissions Allow Karo",
        desc: "App jab permission maange (Location, Nearby Devices), sab pe Allow dabao.",
        icon: "shield-checkmark",
        color: "#818cf8",
      },
      {
        title: "Step 4 — QR Code Scan Karo",
        desc: "Apna camera host ke QR code pe point karo. Auto join ho jayega.",
        icon: "qr-code",
        color: "#38bdf8",
      },
      {
        title: "Step 5 — Host Ka Wait Karo",
        desc: "Join hone ke baad host ka wait karo match start karne ka. Wi-Fi disconnect mat karna!",
        icon: "time-outline",
        color: "#facc15",
      },
      {
        title: "Connect Nahi Ho Raha?",
        desc: "Mobile data OFF hai check karo, host ka Wi-Fi connected hai, aur dono phones paas mein hain.",
        icon: "alert-circle-outline",
        color: "#f97316",
      },
    ],
  },
};
