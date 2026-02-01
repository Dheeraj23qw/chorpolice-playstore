import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { InteractionManager, type ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import { captureScreen } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import type { RootState, AppDispatch } from "@/redux/store";
import { resetGamefromRedux, playAgain } from "@/redux/reducers/playerReducer";
import { PlayerName, PlayerScore } from "@/types/redux/reducers";

/* -------------------------------- Types -------------------------------- */

type PlayerImage = {
  src: ImageSourcePropType;
  type?: "default" | "avatar" | "gallery";
};

type Winner = {
  playerName: string;
  totalScore: number;
};

/* ------------------------------ Constants ------------------------------ */

const FALLBACK_IMAGE: ImageSourcePropType = require("@/assets/images/bg/gamemode/2.png");

/* ------------------------------ Hook ----------------------------------- */

export const useSortedScores = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // ✅ MOVE STATE INSIDE HOOK
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const navigationLock = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ------------------------------ Cleanup ------------------------------ */

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /* ----------------------------- Selectors ----------------------------- */

  const { selectedImages, playerNames, playerScores, playerImages } =
    useSelector(
      (state: RootState) => ({
        selectedImages: state.player.selectedImages,
        playerNames: state.player.playerNames as PlayerName[],
        playerScores: state.player.playerScores as PlayerScore[],
        playerImages: state.playerImages.images as Record<number, PlayerImage>,
      }),
      shallowEqual
    );

  /* -------------------------- Derived Values --------------------------- */

  const sortedScores = useMemo<PlayerScore[]>(() => {
    if (!playerScores?.length) return [];
    return [...playerScores].sort(
      (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0)
    );
  }, [playerScores]);

  const winner = useMemo<Winner>(() => {
    const top = sortedScores[0];
    return {
      playerName: top?.playerName ?? "",
      totalScore: top?.totalScore ?? 0,
    };
  }, [sortedScores]);

  const winnerIndex = useMemo<number>(() => {
    if (!winner.playerName) return -1;
    return playerNames.findIndex((p) => p.name === winner.playerName);
  }, [winner.playerName, playerNames]);

  const winnerName = useMemo<string>(
    () => winner.playerName || "Unknown Player",
    [winner.playerName]
  );

  const winnerImage = useMemo<ImageSourcePropType>(() => {
    if (winnerIndex < 0) return FALLBACK_IMAGE;
    const imageId = selectedImages[winnerIndex];
    return playerImages?.[imageId]?.src ?? FALLBACK_IMAGE;
  }, [winnerIndex, selectedImages, playerImages]);

  /* ------------------------------ Safe Navigate ------------------------------ */

const safeNavigate = useCallback(
  (route: string) => {
    if (!router || navigationLock.current) return;

    navigationLock.current = true;

    requestAnimationFrame(() => {
      Promise.resolve().then(() => {
        try {
          router.replace(route as any);
        } catch (err) {
          console.warn("Navigation failed:", err);
        } finally {
          navigationLock.current = false;
        }
      });
    });
  },
  [router]
);



  /* ------------------------------ Actions ------------------------------ */

 const handlePlayAgain = useCallback(() => {
  try {
    dispatch(playAgain());
    safeNavigate("/chorpolicegame");
  } catch (error) {
    console.error("handlePlayAgain error:", error);
  }
}, [dispatch, safeNavigate]);

const handleBack = useCallback(() => {
  try {
    dispatch(resetGamefromRedux());
    safeNavigate("/modeselect");
  } catch (error) {
    console.error("handleBack error:", error);
  }
}, [dispatch, safeNavigate]);


  const handleShare = useCallback(async () => {
    try {
      const uri = await captureScreen({
        format: "png",
        quality: 0.9,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return;

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share Game Results",
      });
    } catch (error) {
      console.error("[Share Error]", error);
    }
  }, []);

  /* ------------------------------ Return ------------------------------ */

  return {
    sortedScores,
    playerNames,
    selectedImages,
    winner,
    winnerName,
    winnerImage,
    handlePlayAgain,
    handleBack,
    handleShare,
    isButtonDisabled,
  };
};
