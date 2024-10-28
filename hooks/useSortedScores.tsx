import { useMemo, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "expo-router";
import { captureScreen } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { resetGame, playAgain } from "@/redux/slices/playerSlice";

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

  // State to manage the disabled state of buttons
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Memoized sorted scores
  const sortedScores = useMemo(() => {
    return [...playerScores].sort(
      (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0)
    );
  }, [playerScores]);

  // Handler for replaying the game
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
    dispatch(resetGame());
    setTimeout(() => {
      router.push("/playerName");
    }, 0.06);
  }, [dispatch, router, isButtonDisabled]);

  // Handler for sharing the screenshot of the game results
  const handleShare = useCallback(async () => {
    try {
      // Capture the screen as an image
      const uri = await captureScreen({
        format: "png",
        quality: 0.8,
      });

      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.error("File does not exist:", uri);
        return;
      }

      // Share the image if sharing is available
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
    isButtonDisabled, // return this to manage the button's disabled state in the component
  };
};
