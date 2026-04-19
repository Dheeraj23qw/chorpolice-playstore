// gameStatsActions.ts
import { AppDispatch } from "@/redux/store";
import { addChorPoliceEntry } from "@/features/gameStats/gameStatsSlice";

export const recordCPGame = (
  dispatch: AppDispatch,
  isWinner: boolean,
  reason: "completed" | "host_quit",
) => {
  // prevent counting host_quit as win/loss if you want
  if (reason === "host_quit") return;

  dispatch(addChorPoliceEntry({ isWinner }));
};
