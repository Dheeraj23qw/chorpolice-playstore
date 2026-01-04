import { useMemo, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "expo-router";
import { captureScreen } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from 'expo-file-system/legacy';
import { resetGamefromRedux, playAgain } from "@/redux/reducers/playerReducer";

// Custom hook for managing and sharing sorted scores
export const useSortedScores = () => {
  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages
  );
  const playerNames = useSelector(
    (state: RootState) => state.player.playerNames
  );
  const playerScores = useSelector(
    (state: RootState) => state.player.playerScores
  );

  const router = useRouter();
  const dispatch = useDispatch();

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
  );
  const fallbackImage = require("@/assets/images/image.png");

  const sortedScores = useMemo(() => {
    return [...playerScores].sort(
      (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0)
    );
  }, [playerScores]);

  const winner = sortedScores[0] ?? { playerName: "", totalScore: 0 };

  const winnerName = useMemo(() => {
    return (
      playerNames.find((player) => player.name === winner.playerName)?.name ||
      "Unknown Player"
    );
  }, [winner.playerName, playerNames]);

  const winnerIndex = playerNames.findIndex(
    (player) => player.name === winner.playerName
  );

  const winnerImage = useMemo(() => {
    if (winnerIndex >= 0 && winnerIndex < selectedImages.length) {
      const image = playerImages[selectedImages[winnerIndex]];
      return image?.src || fallbackImage;
    }
    return fallbackImage;
  }, [winnerIndex, selectedImages, playerImages]);

  const winnerPlayerImageType = useMemo(() => {
    if (winnerIndex >= 0 && winnerIndex < selectedImages.length) {
      const imageType = playerImages[selectedImages[winnerIndex]]?.type;
      return imageType || "default";
    }
    return "default";
  }, [winnerIndex, selectedImages, playerImages]);

  const botIndexes = playerNames
    .map((player, idx) => (player.isBot ? idx : -1))
    .filter((idx) => idx !== -1);

  const isCurrentWinnerIsBot = botIndexes.includes(winnerIndex);

  const handlePlayAgain = useCallback(() => {
    if (isButtonDisabled) return;
    setIsButtonDisabled(true);
    dispatch(playAgain());
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
      if (!fileInfo.exists) {
        console.error("File does not exist:", uri);
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Game Results",
          UTI: "public.image",
        });
      } else {
        console.error("Sharing is not available on this device");
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
    isCurrentWinnerIsBot,
  };
};
