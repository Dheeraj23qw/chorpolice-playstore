import { useMemo, useCallback, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import type { ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import { captureScreen } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import type { RootState, AppDispatch } from "@/redux/store";
import { resetGamefromRedux, playAgain } from "@/redux/reducers/playerReducer";
import { PlayerName, PlayerScore } from "@/types/redux/reducers";
import { useIsRouterReady } from "@/utils/useIsNavigationReady";

/* -------------------------------- Types -------------------------------- */

type PlayerImage = {
  src: ImageSourcePropType;
  type?: "default" | "avatar" | "gallery";
};

type Winner = {
  playerName: string;
  totalScore: number;
};

type WinnerImageType = NonNullable<PlayerImage["type"]>;

/* ------------------------------ Constants ------------------------------ */

const FALLBACK_IMAGE: ImageSourcePropType = require("@/assets/images/bg/gamemode/2.png");

/* ------------------------------ Hook ----------------------------------- */

export const useSortedScores = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  // ✅ FIX 1: Move the readiness check INSIDE the hook
  const isReady = useIsRouterReady();

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

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
    if (!playerScores.length) return [];
    return [...playerScores].sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));
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

  const winnerName = useMemo<string>(() => winner.playerName || "Unknown Player", [winner.playerName]);

  const winnerImage = useMemo<ImageSourcePropType>(() => {
    if (winnerIndex < 0) return FALLBACK_IMAGE;
    const imageId = selectedImages[winnerIndex];
    return playerImages[imageId]?.src ?? FALLBACK_IMAGE;
  }, [winnerIndex, selectedImages, playerImages]);

  const winnerPlayerImageType = useMemo<WinnerImageType>(() => {
    if (winnerIndex < 0) return "default";
    const imageId = selectedImages[winnerIndex];
    return playerImages[imageId]?.type ?? "default";
  }, [winnerIndex, selectedImages, playerImages]);

  /* ------------------------------ Actions ------------------------------ */

  const handlePlayAgain =() => {
  
    dispatch(playAgain());

    setTimeout(() => {
      router.replace("/chorpolicegame");
    }, 1500); 
  }

  const handleBack = () => {

    dispatch(resetGamefromRedux());

    setTimeout(() => {
      router.replace("/modeselect");
    }, 1500);
  }

  const handleShare = useCallback(async () => {
    try {
      const uri = await captureScreen({ format: "png", quality: 0.9 });
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

  return {
    sortedScores,
    playerNames,
    selectedImages,
    isButtonDisabled,
    winner,
    winnerName,
    winnerImage,
    winnerPlayerImageType,
    handlePlayAgain,
    handleBack,
    handleShare,
  };
};