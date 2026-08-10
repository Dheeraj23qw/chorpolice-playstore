import { playerImages } from "@/constants/playerData";
import { ImageSourcePropType } from "react-native";

export type CharacterDrawerContext =
  | "home"
  | "single_player"
  | "multiplayer";

export interface CharacterDrawerPick {
  message: string;
  avatarSource: ImageSourcePropType;
}

// ─── Generic messages ────────────────────────────────────────────────────────

const GENERIC_MESSAGES: Record<CharacterDrawerContext, string[]> = {
  home: [
    "Hey! You're back! Ready to play? 🎮",
    "Let's play a round! 🔥",
    "Come on, champ. Your next win is waiting!",
    "Ready? Let's do this! 💪",
    "Back for another game? 😎",
    "Let's see what you've got!",
    "Think you can take the crown? 👑",
    "Alright, detective. Time to show your skills! 🕵️",
    "The game is ready. Are you?",
    "Let's catch some thieves! 🚔",
    "Got your friends with you? Let's make it interesting! 😏",
    "Playing with friends is way more fun! 🎮",
    "Call your gang. It's game time! 🔥",
  ],

  single_player: [
    "Just you and the bots. Good luck! 😏",
    "Ready to take on the bots?",
    "Let's see if you can beat all three! 🤖",
    "No team today. Just you!",
    "Think fast! The bots won't wait. ⚡",
    "Alright, detective. You're on your own! 🕵️",
    "Three bots. One player. Let's go! 🔥",
    "Show those bots who's boss!",
  ],

  multiplayer: [
    "Got your friends ready? Let's play! 🎮",
    "Alright, who's taking the win today? 😎",
    "Bring your squad. Let's settle this!",
    "Let's see who's actually the best! 🔥",
    "Call your friends. We need a challenger!",
    "Your friends are waiting. Don't keep them waiting! 😏",
    "One game. One winner. Let's go!",
    "Think your friend can beat you? Find out!",
  ],
};

// ─── Character profiles ─────────────────────────────────────────────────────

interface RoleProfile {
  name: string;
  src: ImageSourcePropType;
  messages: Record<CharacterDrawerContext, string[]>;
}

const ROLE_PROFILES: RoleProfile[] = [
  // ── THIEF ─────────────────────────────────────────────────────────────────
  {
    name: "Thief",
    src: require("@/assets/images/chorsipahi/thief.webp"),
    messages: {
      home: [
        "Psst... ready to steal a win? 😏",
        "Keep it quiet... we're on a mission! 🤫",
        "I know a shortcut to victory. Follow me! 🏃",
        "Quick! Before the police catch us! 😂",
        "I've got a little plan. You in?",
      ],
      single_player: [
        "Those bots won't see me coming! 😏",
        "Let's steal this win!",
        "Quick answers. Easy win. That's the plan!",
        "The bots look nervous already! 😂",
        "Come on, let's fool these bots!",
      ],
      multiplayer: [
        "Your friends aren't watching... perfect! 😏",
        "I'm taking their coins. Don't stop me!",
        "Think your friends can catch us? 😂",
        "Let's sneak past everyone!",
        "Keep an eye on your coins! 👀",
      ],
    },
  },

  // ── POLICE ────────────────────────────────────────────────────────────────
  {
    name: "Police",
    src: require("@/assets/images/chorsipahi/police.webp"),
    messages: {
      home: [
        "Alright, detective. Let's get to work! 🚓",
        "The streets need us. Time to play!",
        "No thief is getting away today! 🚨",
        "Ready for duty, officer?",
        "Let's catch some thieves! 🚔",
      ],
      single_player: [
        "Those bots are under investigation! 🚓",
        "I'll handle the bots. You get the answers!",
        "Time to catch all three! 🚨",
        "Nobody's escaping this round!",
        "Case open. Let's go! 🕵️",
      ],
      multiplayer: [
        "I've got my eye on your friends! 👀",
        "Someone's getting caught today! 🚓",
        "Alright, suspects. Let's see what you've got!",
        "No cheating on my watch! 🚨",
        "This whole game is under investigation!",
      ],
    },
  },

  // ── KING ─────────────────────────────────────────────────────────────────
  {
    name: "King",
    src: require("@/assets/images/chorsipahi/king.webp"),
    messages: {
      home: [
        "Welcome back, champion! 👑",
        "The throne is waiting for you!",
        "Come on. Let's win this kingdom!",
        "Your kingdom needs a champion!",
        "Ready to rule the game? 👑",
      ],
      single_player: [
        "Three bots? They dare challenge me? 👑",
        "Let the bots try. I'll be waiting!",
        "The crown isn't going anywhere!",
        "Time to show them who's king! 👑",
        "Bots, prepare yourselves!",
      ],
      multiplayer: [
        "There's only one crown. It's mine! 👑",
        "Friends or not, I'm taking the throne!",
        "Who thinks they can beat the king?",
        "Come on, challengers. Step up!",
        "The crown is up for grabs. Good luck!",
      ],
    },
  },

  // ── ADVISOR ───────────────────────────────────────────────────────────────
  {
    name: "Advisor",
    src: require("@/assets/images/chorsipahi/advisor.webp"),
    messages: {
      home: [
        "I've got a plan. Let's begin. 🧠",
        "Think before you move. That's the trick!",
        "A little strategy goes a long way.",
        "Ready? I've got a few ideas...",
        "Let's play smart today. 🧠",
      ],
      single_player: [
        "I've been studying these bots. 😉",
        "Stay calm. Think first, answer second.",
        "The bots have a plan. So do we.",
        "Don't rush. The right answer wins!",
        "I've got a feeling we'll beat them.",
      ],
      multiplayer: [
        "I've already figured out their strategy. 😏",
        "Watch your friends. They're planning something!",
        "Stay sharp. Everyone wants the win!",
        "Think carefully. Your friends are watching!",
        "Let's outsmart them!",
      ],
    },
  },
];

// ─── Avatar pool ────────────────────────────────────────────────────────────

const KID_AVATARS: ImageSourcePropType[] = Object.values(playerImages).map(
  (p) => p.src,
);

const ALL_AVATARS: ImageSourcePropType[] = [
  ...KID_AVATARS,
  ...ROLE_PROFILES.map((p) => p.src),
];

const ROLE_BY_SRC = new Map<ImageSourcePropType, RoleProfile>(
  ROLE_PROFILES.map((p) => [p.src, p]),
);

/**
 * Picks a random avatar and a matching message.
 */
export const getRandomCharacterDrawerPick = (
  context: CharacterDrawerContext,
): CharacterDrawerPick => {
  const avatarSource =
    ALL_AVATARS[Math.floor(Math.random() * ALL_AVATARS.length)];

  const role = ROLE_BY_SRC.get(avatarSource);
  const pool = role
    ? role.messages[context]
    : GENERIC_MESSAGES[context];

  return {
    message: pool[Math.floor(Math.random() * pool.length)],
    avatarSource,
  };
};
