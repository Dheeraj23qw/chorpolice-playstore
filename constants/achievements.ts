import { QuizStatsState } from "@/features/quizStats/quizStatsTypes";
import * as LucideIcons from "lucide-react-native";

export interface Achievement {
  id: number;
  cat: "Battle" | "Treasury" | "Career" | "Daily" | "Special";
  title: string;
  iconName: keyof typeof LucideIcons;
  desc: string;
  goal: number;
  statKey?: keyof QuizStatsState;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

export const ACHIEVEMENT_DATA: Achievement[] = [
  // --- BATTLE ---
  { id: 1, cat: "Battle", title: "First Blood", iconName: "Droplets", desc: "Win your first game", goal: 1, statKey: "totalWins", rarity: "Common" },
  { id: 2, cat: "Battle", title: "Sharp Eye", iconName: "Eye", desc: "50% accuracy", goal: 50, statKey: "averageAccuracy", rarity: "Rare" },
  { id: 3, cat: "Battle", title: "Deadshot", iconName: "Crosshair", desc: "80% accuracy", goal: 80, statKey: "averageAccuracy", rarity: "Epic" },
  { id: 4, cat: "Battle", title: "God Aim", iconName: "Target", desc: "100% accuracy", goal: 100, statKey: "averageAccuracy", rarity: "Legendary" },
  { id: 5, cat: "Battle", title: "Veteran", iconName: "Sword", desc: "Win 100 total matches", goal: 100, statKey: "totalWins", rarity: "Rare" },
  { id: 6, cat: "Battle", title: "Hard Carry", iconName: "Weight", desc: "Win 20 Hard matches", goal: 20, statKey: "hardWins", rarity: "Epic" },
  { id: 7, cat: "Battle", title: "Elite Agent", iconName: "UserCheck", desc: "Win 50 Hard matches", goal: 50, statKey: "hardWins", rarity: "Legendary" },
  { id: 8, cat: "Battle", title: "Apex Predator", iconName: "Zap", desc: "10 win streak", goal: 10, statKey: "highestStreak", rarity: "Legendary" },
  { id: 9, cat: "Battle", title: "Immortal", iconName: "Skull", desc: "20 win streak", goal: 20, statKey: "highestStreak", rarity: "Legendary" },
  { id: 10, cat: "Battle", title: "Untouchable", iconName: "Ghost", desc: "50 win streak", goal: 50, statKey: "highestStreak", rarity: "Legendary" },

  // --- TREASURY ---// --- TREASURY: Wealth Milestones ---
{ id: 11, cat: "Treasury", title: "Piggy Bank", iconName: "PiggyBank", desc: "10,000 Coins", goal: 10000, rarity: "Common" },
{ id: 12, cat: "Treasury", title: "Pocket Change", iconName: "Coins", desc: "20,000 Coins", goal: 20000, rarity: "Common" },
{ id: 13, cat: "Treasury", title: "Money Bag", iconName: "Briefcase", desc: "50,000 Coins", goal: 50000, rarity: "Rare" },
{ id: 14, cat: "Treasury", title: "Gold Miner", iconName: "Pickaxe", desc: "100,000 Coins", goal: 100000, rarity: "Rare" },
{ id: 15, cat: "Treasury", title: "Richie", iconName: "Gem", desc: "150,000 Coins", goal: 150000, rarity: "Epic" },
{ id: 16, cat: "Treasury", title: "Vault King", iconName: "Vault", desc: "200,000 Coins", goal: 200000, rarity: "Epic" },
{ id: 17, cat: "Treasury", title: "Half Million", iconName: "Banknote", desc: "500,000 Coins", goal: 500000, rarity: "Legendary" },
{ id: 18, cat: "Treasury", title: "Millionaire", iconName: "Crown", desc: "1,000,000 Coins", goal: 1000000, rarity: "Legendary" },
{ id: 19, cat: "Treasury", title: "Multimillion", iconName: "Trophy", desc: "5,000,000 Coins", goal: 5000000, rarity: "Legendary" },
{ id: 20, cat: "Treasury", title: "The Bank", iconName: "Landmark", desc: "10,000,000 Coins", goal: 10000000, rarity: "Legendary" },


  // --- CAREER ---
  { id: 21, cat: "Career", title: "Newbie", iconName: "Baby", desc: "Play 5 matches", goal: 5, statKey: "totalQuizzes", rarity: "Common" },
  { id: 22, cat: "Career", title: "Rookie", iconName: "Footprints", desc: "Play 20 matches", goal: 20, statKey: "totalQuizzes", rarity: "Common" },
  { id: 23, cat: "Career", title: "Soldier", iconName: "Shield", desc: "Play 50 matches", goal: 50, statKey: "totalQuizzes", rarity: "Rare" },
  { id: 24, cat: "Career", title: "Veteran", iconName: "Medal", desc: "Play 100 matches", goal: 100, statKey: "totalQuizzes", rarity: "Rare" },
  { id: 25, cat: "Career", title: "Elite", iconName: "Star", desc: "Play 250 matches", goal: 250, statKey: "totalQuizzes", rarity: "Epic" },
  { id: 26, cat: "Career", title: "Commander", iconName: "Siren", desc: "Play 500 matches", goal: 500, statKey: "totalQuizzes", rarity: "Epic" },
  { id: 27, cat: "Career", title: "Legend", iconName: "Flame", desc: "Play 1,000 matches", goal: 1000, statKey: "totalQuizzes", rarity: "Legendary" },
  { id: 28, cat: "Career", title: "Mythic", iconName: "Sparkles", desc: "Play 2,500 matches", goal: 2500, statKey: "totalQuizzes", rarity: "Legendary" },
  { id: 29, cat: "Career", title: "Titan", iconName: "Mountain", desc: "Play 5,000 matches", goal: 5000, statKey: "totalQuizzes", rarity: "Legendary" },
  { id: 30, cat: "Career", title: "The GOAT", iconName: "ChevronsUp", desc: "Play 10,000 matches", goal: 10000, statKey: "totalQuizzes", rarity: "Legendary" },

  // --- DAILY ---
  { id: 31, cat: "Daily", title: "Early Bird", iconName: "Bird", desc: "First win of day", goal: 1, statKey: "dailyStreak", rarity: "Common" },
  { id: 32, cat: "Daily", title: "Double Up", iconName: "Twitch", desc: "2 day streak", goal: 2, statKey: "dailyStreak", rarity: "Common" },
  { id: 33, cat: "Daily", title: "On Fire", iconName: "FlameKindling", desc: "7 day streak", goal: 7, statKey: "dailyStreak", rarity: "Rare" },
  { id: 34, cat: "Daily", title: "Reliable", iconName: "CalendarCheck", desc: "14 day streak", goal: 14, statKey: "dailyStreak", rarity: "Rare" },
  { id: 35, cat: "Daily", title: "Addicted", iconName: "HeartPulse", desc: "30 day streak", goal: 30, statKey: "dailyStreak", rarity: "Epic" },
  { id: 36, cat: "Daily", title: "Loyal Fan", iconName: "Infinity", desc: "100 day streak", goal: 100, statKey: "dailyStreak", rarity: "Legendary" },
  { id: 37, cat: "Daily", title: "Grinder", iconName: "Hammer", desc: "Play 50 games total", goal: 50, statKey: "totalQuizzes", rarity: "Rare" },
  { id: 38, cat: "Daily", title: "Machine", iconName: "Cpu", desc: "Play 100 games total", goal: 100, statKey: "totalQuizzes", rarity: "Epic" },
  { id: 39, cat: "Daily", title: "Active", iconName: "Zap", desc: "Win 10 games", goal: 10, statKey: "totalWins", rarity: "Common" },
  { id: 40, cat: "Daily", title: "Warrior", iconName: "HandMetal", desc: "Win 25 games", goal: 25, statKey: "totalWins", rarity: "Rare" },

  // --- SPECIAL ---
  { id: 41, cat: "Special", title: "Warm Up", iconName: "Coffee", desc: "Win 50 Easy matches", goal: 50, statKey: "easyWins", rarity: "Common" },
  { id: 42, cat: "Special", title: "Easy Rider", iconName: "Bike", desc: "Win 100 Easy matches", goal: 100, statKey: "easyWins", rarity: "Rare" },
  { id: 43, cat: "Special", title: "Rising Star", iconName: "Sunrise", desc: "Win 25 Medium matches", goal: 25, statKey: "mediumWins", rarity: "Rare" },
  { id: 44, cat: "Special", title: "Challenger", iconName: "Rocket", desc: "Win 75 Medium matches", goal: 75, statKey: "mediumWins", rarity: "Epic" },
  { id: 45, cat: "Special", title: "Elite Expert", iconName: "Dna", desc: "Win 150 Medium matches", goal: 150, statKey: "mediumWins", rarity: "Epic" },
  { id: 46, cat: "Special", title: "Brainiac", iconName: "Brain", desc: "Win 10 Hard matches", goal: 10, statKey: "hardWins", rarity: "Rare" },
  { id: 47, cat: "Special", title: "Professor", iconName: "GraduationCap", desc: "Win 50 Hard matches", goal: 50, statKey: "hardWins", rarity: "Epic" },
  { id: 48, cat: "Special", title: "Genius", iconName: "Lightbulb", desc: "Win 100 Hard matches", goal: 100, statKey: "hardWins", rarity: "Legendary" },
  { id: 49, cat: "Special", title: "All-Rounder", iconName: "Globe", desc: "Win 150 total matches", goal: 150, statKey: "totalWins", rarity: "Epic" },
  { id: 50, cat: "Special", title: "Grandmaster", iconName: "Axe", desc: "Win 250 total matches", goal: 250, statKey: "totalWins", rarity: "Legendary" },
];
