import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import {
  setPlayerNames,
  setSelectedImages,
  setGameMode,
} from "@/redux/reducers/playerReducer";
import { playSound } from "@/redux/reducers/soundReducer";
import { RootState } from "@/redux/store";
import { GameMode } from "@/types/redux/reducers";
import { generateRandomName } from "@/utils/generateRandomnames";

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

      dispatch(playSound("level"));

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
    if (name.length > MAX_NAME_LENGTH) return;
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
    [imageNames], // Keeps the logic fresh whenever user types
  );

  const checkForDuplicateNames = useCallback((): boolean => {
    const names = Object.values(imageNames).filter(
      (name) => name.trim() !== "",
    );
    return new Set(names).size !== names.length;
  }, [imageNames]);

  // ---------------------------
  // START GAME
  // ---------------------------
  const handleStartAdventure = useCallback(async () => {
    if (checkForDuplicateNames()) return;

    dispatch(playSound("select"));
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

      router.push("/chorpolicegame");
    } catch (error) {
      console.error("Failed to start adventure:", error);
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

  // ---------------------------
  // REMOVE PLAYER (Previously handleAlertConfirm)
  // ---------------------------
  const removePlayer = useCallback(
    (imageId: number) => {
      dispatch(playSound("select"));

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
      // Instead of showing a modal, we just remove the player directly
      if (selectedImages.includes(imageId)) {
        dispatch(playSound("select"));

        setSelectedImagesState((prev) => prev.filter((id) => id !== imageId));
        setPlayerNamesState((prev) => prev.filter((p) => p.id !== imageId));
        setImageNamesState((prev) => {
          const { [imageId]: _, ...rest } = prev;
          return rest;
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
