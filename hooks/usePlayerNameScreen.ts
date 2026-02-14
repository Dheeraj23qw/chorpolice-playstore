import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import {
  setPlayerNames,
  setSelectedImages,
  setGameMode,
} from "@/redux/reducers/playerReducer";
import { RootState } from "@/redux/store";
import { GameMode } from "@/types/redux/reducers";
import { generateRandomName } from "@/utils/generateRandomnames";
import { ALERT_TYPE, Dialog, Toast } from "react-native-alert-notification";
import { AudioEngine } from "@/audio/audioEngine";

const MAX_SELECTED_IMAGES = 4;
const MAX_NAME_LENGTH = 8;

interface PlayerName {
  id: number;
  name: string;
}

export const usePlayerNameScreen = () => {
  const [selectedImages, setSelectedImagesState] = useState<number[]>([]);
  const [imageNames, setImageNamesState] = useState<Record<number, string>>({});
  const [gameModeStatus, setGameModeStatus] = useState<GameMode | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [playerNames, setPlayerNamesState] = useState<PlayerName[]>([]);

  const dispatch = useDispatch();
  const router = useRouter();

  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images,
  );



  useEffect(() => {
    if (gameModeStatus !== null) {
      dispatch(setGameMode(gameModeStatus));
    }
  }, [gameModeStatus, dispatch]);

  // ---------------------------
  // IMAGE SELECT
  // ---------------------------
  const handleImageSelect = useCallback(
    (imageId: number, gameMode: GameMode) => {
      setGameModeStatus(gameMode);

      if (!playerImages[imageId]) return;

      // Logic to prevent adding more than 4 or duplicates
      if (
        selectedImages.includes(imageId) ||
        selectedImages.length >= MAX_SELECTED_IMAGES
      ) {
        return;
      }

      AudioEngine.play("level", "gameplay");


      setSelectedImagesState((prev) => [...prev, imageId]);

      const newPlayer: PlayerName = {
        id: imageId,
        name: "",
      };

      setPlayerNamesState((prev) => [...prev, newPlayer]);
      dispatch(setPlayerNames([...playerNames, newPlayer]));
    },
    [selectedImages, playerImages, dispatch, playerNames],
  );

  // ---------------------------
  // NAME CHANGE
  // ---------------------------
  const handleNameChange = useCallback((imageId: number, name: string) => {
    if (name.length > MAX_NAME_LENGTH) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Limit Reached",
        textBody: `Names cannot exceed ${MAX_NAME_LENGTH} characters.`,
        autoClose: 1500, // Disappears quickly so it doesn't stay in the way
      });
      return;
    }

    setImageNamesState((prev) => ({ ...prev, [imageId]: name }));
  }, []);

  // ---------------------------
  // DEFAULT NAMES
  // ---------------------------
  const getDefaultNames = useCallback(
    (imageIds: number[], gameMode: GameMode | null) => {
      const usedNames = new Set<string>(
        Object.values(imageNames)
          .map((n) => n.trim())
          .filter((n) => n !== ""),
      );

      return imageIds.reduce(
        (acc, id, index) => {
          // 2. Only generate a name if the current image has no name
          if (!imageNames[id] || imageNames[id].trim() === "") {
            acc[id] = generateRandomName(usedNames, gameMode, index);
          }
          return acc;
        },
        {} as Record<number, string>,
      );
    },
    [imageNames],
  );

  const checkForDuplicateNames = useCallback((): boolean => {
    const names = Object.values(imageNames)
      .map((name) => name.trim())
      .filter((name) => name !== "");

    const hasDuplicates = new Set(names).size !== names.length;

    if (hasDuplicates) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Duplicate Names",
        textBody:
          "Multiple players have the same name. Please give everyone a unique name!",
        button: "Fix It",
      });
      return true;
    }

    return false; // No duplicates (Proceed)
  }, [imageNames]);

  const handleStartAdventure = useCallback(async () => {
    if (checkForDuplicateNames()) return;

    AudioEngine.play("select", "ui");

    setIsButtonDisabled(true);

    try {
      const updatedImageNames = {
        ...imageNames,
        ...getDefaultNames(selectedImages, gameModeStatus),
      };

      const imagesWithDetails = selectedImages.map((id) => ({
        id,
        name: updatedImageNames[id],
      }));

      await dispatch(setSelectedImages(selectedImages));
      await dispatch(setPlayerNames(imagesWithDetails));

      router.push("/chor-police");
    } catch (error) {
      console.error("Failed to start adventure:", error);

      // 3. Error Notification
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Launch Failed",
        textBody:
          "Something went wrong while setting up the game. Please try again.",
        button: "Close",
      });
    } finally {
      setIsButtonDisabled(false);
    }
  }, [
    selectedImages,
    imageNames,
    getDefaultNames,
    checkForDuplicateNames,
    dispatch,
    router,
    gameModeStatus,
  ]);

  const removePlayer = useCallback(
    (imageId: number) => {
      AudioEngine.play("select", "ui");


      setSelectedImagesState((prev) => prev.filter((id) => id !== imageId));
      setPlayerNamesState((prev) => prev.filter((p) => p.id !== imageId));
      setImageNamesState((prev) => {
        const { [imageId]: _, ...rest } = prev;
        return rest;
      });
    },
    [dispatch],
  );

  const handleSelectedImageClick = useCallback(
    (imageId: number) => {
      if (selectedImages.includes(imageId)) {
        // 1. Effects and State Updates
        AudioEngine.play("select", "ui");


        setSelectedImagesState((prev) => prev.filter((id) => id !== imageId));
        setPlayerNamesState((prev) => prev.filter((p) => p.id !== imageId));
        setImageNamesState((prev) => {
          const { [imageId]: _, ...rest } = prev;
          return rest;
        });

        // 2. Show the Notification
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Player Removed",
          textBody: "The selected player has been removed.",
          autoClose: 2000, // Closes after 2 seconds
        });
      }
    },
    [selectedImages, dispatch],
  );

  return {
    selectedImages,
    imageNames,
    handleImageSelect,
    handleNameChange,
    handleStartAdventure,
    removePlayer,
    isButtonDisabled,
    handleSelectedImageClick,
  };
};
