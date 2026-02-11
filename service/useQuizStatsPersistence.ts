// useQuizStatsPersistence.ts
import { loadQuizStats, saveQuizStats, setQuizStats } from "@/features/quizStats/quizStatsSlice";
import { RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useQuizStatsPersistence = () => {
  const dispatch = useDispatch();
  const quizStats = useSelector((state: RootState) => state.quizStats);

  // Hydrate once on app start
  useEffect(() => {
    const hydrate = async () => {
      const loadedStats = await loadQuizStats();
      dispatch(setQuizStats(loadedStats));
    };
    hydrate();
  }, [dispatch]);

  // Save automatically whenever stats change
  useEffect(() => {
    saveQuizStats(quizStats);
  }, [quizStats]);
};
