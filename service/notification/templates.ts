export interface NotificationTemplate {
  id: string;
  titles: string[];
  bodies: string[];
  data?: Record<string, any>;
}

export const SPIN_TEMPLATE: NotificationTemplate = {
  id: "spin-unlock",
  titles: [
    "🚨 Your FREE Spin Is Waiting!",
    "🎡 Spin Now Before It Expires!",
    "💰 Coins Are Waiting For You!",
    "🔥 Lucky Wheel Is Live!",
  ],
  bodies: [
    "One tap = instant reward 🎁",
    "Your spin is unlocked — don't waste it!",
    "Hit the wheel and grab your bonus now!",
    "Spin now or miss today's surprise!",
  ],
  data: { screen: "/earn" },
};



export const DAILY_STREAK_TEMPLATE: NotificationTemplate = {
  id: "quiz-daily-streak",
  titles: [
    "⚠️ Your Streak Is About To Break!",
    "🔥 {streak}-Day Streak in Danger!",
    "⏳ 1 Quiz Saves Your Streak!",
    "🚨 Don't Lose Your {streak}-Day Run!",
  ],
  bodies: [
    "Play now or your streak resets to 0 😬",
    "One quick win keeps your streak alive.",
    "You worked hard for this streak — protect it!",
    "Don't let today ruin your progress.",
  ],
  data: { screen: "/" },
};
