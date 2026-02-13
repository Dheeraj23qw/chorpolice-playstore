import { NotificationTemplate } from "./types";


export const DORMANT_PLAYER_TEMPLATE: NotificationTemplate = {
  id: "dormant-player",
  titles: [
    "👀 Hey, we miss you!",
    "⏰ Your streak is waiting!",
    "🔥 Don’t let your progress fade!",
    "🚨 Your quizzes are calling!"
  ],
  bodies: [
    "Come back and continue your streak 🏆",
    "It's been a while — your rewards are ready! 🎁",
    "Your streak is slipping! One quick quiz can save it 💪",
    "We saved a challenge just for you — tap to play now!",
    "Don’t miss today’s quiz — your streak depends on it!",
    "Your coins and rewards are waiting — claim them now!"
  ],
  data: { screen: "/" }, 
};


export const NEW_FEATURE_TEMPLATE: NotificationTemplate = {
  id: "new-feature",
  titles: [
    "🎉 New Feature Alert!",
    "🚀 Check Out What's New!",
    "Something Exciting Just Dropped!",
    "New Update – Play Now!"
  ],
  bodies: [
    "Try the new quiz mode today 🏆",
    "Discover fresh challenges and rewards!",
    "We've added something special for you!",
    "Explore the latest feature before anyone else!"
  ],
  data: { screen: "/news" },
};

export const REWARD_CLAIM_TEMPLATE: NotificationTemplate = {
  id: "reward-claim",
  titles: [
    "💰 Your Reward Awaits!",
    "🎁 Claim Your Daily Bonus!",
    "Coins Are Waiting For You!",
    "Don't Miss Your Free Gift!"
  ],
  bodies: [
    "One tap = instant reward 🎉",
    "Claim your bonus before it expires!",
    "Your reward is ready — collect now!",
    "Don't miss out on today's coins!"
  ],
  data: { screen: "/earn" },
};

export const SPIN_TEMPLATE: NotificationTemplate = {
  id: "spin-unlock",
  titles: [
    "🚨 Your FREE Spin Is Waiting!",
    "🎡 Spin Now Before It Expires!",
    "💰 Coins Are Waiting For You!",
    "🔥 Lucky Wheel Is Live!"
  ],
  bodies: [
    "One tap = instant reward 🎁",
    "Your spin is unlocked — don't waste it!",
    "Hit the wheel and grab your bonus now!",
    "Spin now or miss today's surprise!"
  ],
  data: { screen: "/earn" },
};

export const DAILY_STREAK_TEMPLATE: NotificationTemplate = {
  id: "quiz-daily-streak",
  titles: [
    "⚠️ Your Streak Is About To Break!",
    "🔥 {streak}-Day Streak in Danger!",
    "⏳ 1 Quiz Saves Your Streak!",
    "🚨 Don't Lose Your {streak}-Day Run!"
  ],
  bodies: [
    "Play now or your streak resets to 0 😬",
    "One quick win keeps your streak alive.",
    "You worked hard for this streak — protect it!",
    "Don't let today ruin your progress."
  ],
  data: { screen: "/" },
};

