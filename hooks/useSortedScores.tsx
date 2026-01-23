import { useMemo, useCallback, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "expo-router";
import { captureScreen } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import {
  resetGamefromRedux,
  playAgain,
} from "@/redux/reducers/playerReducer";

export const useSortedScores = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // ✅ Group selectors to reduce re-renders
  const { selectedImages, playerNames, playerScores } = useSelector(
    (state: RootState) => ({
      selectedImages: state.player.selectedImages,
      playerNames: state.player.playerNames,
      playerScores: state.player.playerScores,
    }),
    shallowEqual
  );

  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images,
    shallowEqual
  );

  const fallbackImage = require("@/assets/images/bg/gamemode/2.png");

  // -------------------- Sorted Scores --------------------
  const sortedScores = useMemo(() => {
    if (!playerScores.length) return [];
    return [...playerScores].sort(
      (a, b) => (b.totalScore || 0) - (a.totalScore || 0)
    );
  }, [playerScores]);

  const winner = sortedScores[0] ?? { playerName: "", totalScore: 0 };

  // -------------------- Winner Name --------------------
  const winnerName = useMemo(() => {
    const player = playerNames.find(
      (p) => p.name === winner.playerName
    );
    return player?.name ?? "Unknown Player";
  }, [winner.playerName, playerNames]);

  // -------------------- Winner Image --------------------
  const winnerIndex = useMemo(() => {
    return playerNames.findIndex(
      (p) => p.name === winner.playerName
    );
  }, [winner.playerName, playerNames]);

  const winnerImage = useMemo(() => {
    if (winnerIndex < 0) return fallbackImage;

    const imageId = selectedImages[winnerIndex];
    return playerImages[imageId]?.src ?? fallbackImage;
  }, [winnerIndex, selectedImages, playerImages]);

  const winnerPlayerImageType = useMemo(() => {
    if (winnerIndex < 0) return "default";

    const imageId = selectedImages[winnerIndex];
    return playerImages[imageId]?.type ?? "default";
  }, [winnerIndex, selectedImages, playerImages]);

  // -------------------- Actions --------------------
  const handlePlayAgain = useCallback(() => {
    if (isButtonDisabled) return;

    setIsButtonDisabled(true);
    dispatch(playAgain());

    // Small delay to avoid accidental double navigation
    setTimeout(() => {
      router.push("/chorpolicegame");
    }, 100);
  }, [dispatch, router, isButtonDisabled]);

  const handleBack = useCallback(() => {
    if (isButtonDisabled) return;

    setIsButtonDisabled(true);
    dispatch(resetGamefromRedux());
    router.push("/modeselect");
  }, [dispatch, router, isButtonDisabled]);

  const handleShare = useCallback(async () => {
    try {
      const uri = await captureScreen({
        format: "png",
        quality: 0.8,
      });

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) return;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Game Results",
          UTI: "public.image",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, []);

  return {
    sortedScores,
    playerNames,
    selectedImages,
    handlePlayAgain,
    handleBack,
    handleShare,
    isButtonDisabled,
    winnerName,
    winnerImage,
    winnerPlayerImageType,
    winner,
  };
};
