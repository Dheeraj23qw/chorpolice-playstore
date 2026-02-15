import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addUnlocked } from "@/features/awards/awardsSlice";
import { ACHIEVEMENT_DATA } from "@/constants/achievements";

export function useAwards() {
  const stats = useSelector((state: any) => state.quizStats);
  const coins = useSelector((state: any) => state.wallet.coins);
  const dispatch = useDispatch();

  const [isReady, setIsReady] = useState(false);

  // Delay setting ready to simulate InteractionManager
  useEffect(() => {
    const id = setTimeout(() => setIsReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  // Compute progress
  const getProgress = (current: number, goal: number) => {
    const percent = Math.min(Math.round((current / goal) * 100), 100);
    return {
      percent,
      status: percent >= 100 ? "unlocked" : percent > 0 ? "progress" : "locked",
    };
  };

  // Rarity styles
  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Epic": return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "Rare": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  // Dispatch newly unlocked awards
  useEffect(() => {
    if (!isReady) return;

    const unlockedIds = ACHIEVEMENT_DATA.filter((award) => {
      const current =
        award.cat === "Treasury"
          ? coins
          : award.statKey
            ? stats[award.statKey] || 0
            : 0;
      return current >= award.goal;
    }).map((award) => award.id);

    if (unlockedIds.length) dispatch(addUnlocked(unlockedIds));
  }, [stats, coins, isReady, dispatch]);

  // Generate collections
  const collections = useMemo(() => {
    if (!isReady) return [];

    const rowConfigs = [
      { id: "Battle", title: "Combat Medals", sub: "Skill & Precision" },
      { id: "Treasury", title: "The Vault", sub: "Wealth Milestones" },
      { id: "Career", title: "Lifetime Progress", sub: "Road to Legend" },
      { id: "Daily", title: "Daily Operations", sub: "Consistency" },
      { id: "Special", title: "Secret Missions", sub: "Special Challenges" },
    ];

    return rowConfigs.map((config) => {
      const data = ACHIEVEMENT_DATA.filter(a => a.cat === config.id).map((award) => {
        const current =
          award.cat === "Treasury"
            ? coins
            : award.statKey
              ? stats[award.statKey] || 0
              : 0;
        return { ...award, ...getProgress(current, award.goal) };
      });

      return { id: config.id, title: config.title, subtitle: config.sub, data };
    });
  }, [stats, coins, isReady]);

  const totalUnlocked = useMemo(() => {
    return collections.reduce((acc, section) => {
      return acc + section.data.filter(a => a.status === "unlocked").length;
    }, 0);
  }, [collections]);

  return { collections, totalUnlocked, getRarityStyles, isReady };
}
