import { storage } from "@/storage/mmkv";
import { QuizStatsState } from "@/features/quizStats/quizStatsTypes";
import { defaultQuizStats } from "@/features/quizStats/quizStatsSlice";

const QUIZ_STATS_KEY = "quiz_stats_v1"; // ✅ versioned key (important)

/**
 * 💾 Save stats
 */
export const saveQuizStats = (stats: QuizStatsState) => {
  try {
    storage.set(QUIZ_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("❌ [QuizStats] Save failed", e);
  }
};

/**
 * 📥 Load stats — merges saved data with defaults to handle schema migrations.
 * If new fields were added (streaks, CP stats), they'll be filled with defaults
 * instead of crashing or returning undefined values.
 */
export const loadQuizStats = (): QuizStatsState | null => {
  try {
    const data = storage.getString(QUIZ_STATS_KEY);

    if (!data) return null;

    const parsed = JSON.parse(data);

    // ✅ basic validation (prevents crashes on schema change)
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    // ✅ Migration: merge with defaults so new fields get filled automatically
    return { ...defaultQuizStats, ...parsed } as QuizStatsState;
  } catch (e) {
    console.error("❌ [QuizStats] Load failed", e);
    return null;
  }
};

/**
 * 🗑️ Clear stats (for logout / testing)
 */
export const clearQuizStats = () => {
  try {
    storage.remove(QUIZ_STATS_KEY);
  } catch (e) {
    console.error("❌ [QuizStats] Clear failed", e);
  }
};
