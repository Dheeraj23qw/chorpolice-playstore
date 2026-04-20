import { useEffect } from "react";

import { ACHIEVEMENT_DATA } from "@/constants/achievements";
import { addUnlocked } from "@/features/awards/awardsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
import { runAfterUI } from "@/utils/runAfterUI";

export function useAwardUnlocking() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector((state) => state.quizStats);
  const coins = useAppSelector((state) => state.wallet.coins);
  const statsMap = stats as unknown as Record<string, number>;

  useEffect(() => {
    runAfterUI(() => {
      const unlockedIds = ACHIEVEMENT_DATA.filter((award) => {
        const current =
          award.cat === "Treasury"
            ? coins
            : award.statKey
              ? statsMap[award.statKey] || 0
              : 0;

        return current >= award.goal;
      }).map((award) => award.id);

      if (unlockedIds.length > 0) {
        dispatch(addUnlocked(unlockedIds));
      }
    });
  }, [coins, dispatch, statsMap]);
}
