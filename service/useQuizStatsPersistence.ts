import { useEffect, useRef } from "react";
import { loadQuizStats, saveQuizStats, setQuizStats } from "@/features/quizStats/quizStatsSlice";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

export const useQuizStatsPersistence = () => {
  const dispatch = useDispatch();
  const quizStats = useSelector((state: RootState) => state.quizStats);
  const hydrated = useRef(false); // ✅ track hydration

  // Hydrate once on app start
  useEffect(() => {
    const hydrate = async () => {
      const loadedStats = await loadQuizStats();
      dispatch(setQuizStats(loadedStats));
      hydrated.current = true; // mark hydration done
      console.log("🟢 [QuizStats] Hydrated from storage:", loadedStats);
    };
    hydrate();
  }, [dispatch]);

  // Save automatically whenever stats change, but only after hydration
  useEffect(() => {
    if (!hydrated.current) return; // ✅ skip save until hydrated
    saveQuizStats(quizStats);
    console.log("💾 [QuizStats] Saved successfully", quizStats);
  }, [quizStats]);
};
