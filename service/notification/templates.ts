import { NotificationTemplate } from "./types";

export const WELCOME_TEMPLATE: NotificationTemplate = {
  id: "welcome-player",
  titles: [
    "Welcome to Chor Police!",
    "Your first challenge is ready!",
    "Thanks for installing Chor Police!",
  ],
  bodies: [
    "Jump in and start your first round now.",
    "Your rewards and game modes are waiting inside.",
    "Open the app and claim your welcome energy boost.",
  ],
  data: { screen: "/mode-select" },
};

export const DORMANT_PLAYER_TEMPLATE: NotificationTemplate = {
  id: "dormant-player",
  titles: [
    "We miss you!",
    "Your streak is waiting!",
    "Do not let your progress fade!",
    "Your quizzes are calling!",
  ],
  bodies: [
    "Come back and continue your streak.",
    "Your rewards are ready to claim.",
    "One quick quiz keeps the momentum going.",
    "We saved a challenge for you. Tap to play.",
  ],
  data: { screen: "/mode-select" },
};

export const NEW_FEATURE_TEMPLATE: NotificationTemplate = {
  id: "new-feature",
  titles: [
    "New Feature Alert!",
    "Check Out What Is New!",
    "Something Exciting Just Dropped!",
    "New Update, Play Now!",
  ],
  bodies: [
    "Try the latest quiz mode today.",
    "Discover fresh challenges and rewards.",
    "We added something special for you.",
    "Explore the newest feature before anyone else.",
  ],
  data: { screen: "/mode-select" },
};

export const REWARD_CLAIM_TEMPLATE: NotificationTemplate = {
  id: "reward-claim",
  titles: [
    "Your Reward Awaits!",
    "Claim Your Daily Bonus!",
    "Coins Are Waiting For You!",
    "Do Not Miss Your Free Gift!",
  ],
  bodies: [
    "One tap unlocks your reward.",
    "Claim your bonus before it expires.",
    "Your reward is ready to collect.",
    "Today's coins are ready for you.",
  ],
  data: { screen: "/earn" },
};

export const SPIN_TEMPLATE: NotificationTemplate = {
  id: "spin-unlock",
  titles: [
    "Your free spin is ready!",
    "Spin now before it expires!",
    "Coins are waiting for you!",
    "Lucky wheel is live!",
  ],
  bodies: [
    "One tap unlocks your spin reward.",
    "Your spin is unlocked and ready.",
    "Tap the wheel and grab your bonus.",
    "Today's surprise spin is waiting.",
  ],
  data: { screen: "/earn" },
};

export const DAILY_STREAK_TEMPLATE: NotificationTemplate = {
  id: "quiz-daily-streak",
  titles: [
    "Your streak needs one more quiz!",
    "{streak}-day streak on the line!",
    "One quiz saves your streak!",
    "Do not lose your {streak}-day run!",
  ],
  bodies: [
    "Play now and keep your streak alive.",
    "One quick win protects today's progress.",
    "You worked hard for this streak. Keep it going.",
    "A single match today keeps the chain alive.",
  ],
  data: { screen: "/mode-select" },
};
