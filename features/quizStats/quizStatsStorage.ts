import { AppDispatch, RootState } from "@/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QuizStatsState, QuizStatsEntry } from "./quizStatsTypes";
import { addQuizEntry, resetQuizStats } from "./quizStatsSlice";

const STORAGE_KEY = "quiz_stats_v1";

// Save current quiz stats to AsyncStorage
export const saveQuizStatsToStorage = async (state: QuizStatsState) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to save quiz stats", err);
  }
};

// Load quiz stats from AsyncStorage
export const loadQuizStatsFromStorage = () => async (dispatch: AppDispatch) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return;

    const parsed: QuizStatsState = JSON.parse(data);

    // Option 1: Reset and restore everything via history
    dispatch(resetQuizStats()); // clear current state
    parsed.history.forEach((entry) => dispatch(addQuizEntry(entry)));

    // Option 2: Or if you want exact restore (directly set state), you’d need a separate reducer
    // dispatch(setQuizStats(parsed));
  } catch (err) {
    console.warn("Failed to load quiz stats", err);
  }
};

// Record a new quiz entry and persist
export const recordQuizEntry = (entry: QuizStatsEntry) => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  dispatch(addQuizEntry(entry));
  const state = getState();
  await saveQuizStatsToStorage(state.quizStats);
};
