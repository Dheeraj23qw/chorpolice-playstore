import { useMemo, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "expo-router";
import { captureScreen } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { resetGame, playAgain } from "@/redux/reducers/playerReducer";

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
  ); // Fetch player images from Redux
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
  // Memoize the winner's image based on their index
  const winnerImage = useMemo(() => {
    // Ensure the selectedImages array has valid indexes
    if (winnerIndex >= 0 && winnerIndex < selectedImages.length) {
      const image = playerImages[selectedImages[winnerIndex]];
      return image && image.src ? image.src : fallbackImage; // Use fallback image if not found
    }

    return fallbackImage; // Fallback to default image if index is invalid
  }, [winner.playerName, selectedImages, playerNames, playerImages]);

  const winnerPlayerImageType = playerImages[selectedImages[winnerIndex]]?.type;

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
    router.push("/modeselect");

    setTimeout(() => {
      dispatch(resetGame());
    }, 500);
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
    winner
  };
};
