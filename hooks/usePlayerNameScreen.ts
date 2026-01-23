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
  const [modals, setModals] = useState({
    modalVisible: false,
    infoModalVisible: false,
    confirmChangeVisible: false,
    infoAddMoreVisible: false,
  });
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [currentImageId, setCurrentImageId] = useState<number | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [playerNames, setPlayerNamesState] = useState<PlayerName[]>([]);

  const dispatch = useDispatch();
  const router = useRouter();

  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
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

      if (!playerImages[imageId]) {
        setAlertMessage("Selected image is not available.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        return;
      }

      if (selectedImages.includes(imageId)) {
        setAlertMessage("Do you want to change Selected Superhero?");
        setCurrentImageId(imageId);
        setModals((prev) => ({ ...prev, confirmChangeVisible: true }));
        return;
      }

      if (selectedImages.length >= MAX_SELECTED_IMAGES) {
        setAlertMessage("You can only pick 4 superheroes.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        return;
      }

      dispatch(playSound("level"));

      if (selectedImages.length === 0) {
        setAlertMessage("Select 3 more avatars to play!");
        setModals((prev) => ({ ...prev, infoAddMoreVisible: true }));
      }

      setSelectedImagesState((prev) => [...prev, imageId]);

      const newPlayer: PlayerName = {
        id: imageId,
        name: "",
      };

      setPlayerNamesState((prev) => [...prev, newPlayer]);
      dispatch(setPlayerNames([...playerNames, newPlayer]));
    },
    [selectedImages, playerImages, dispatch, playerNames]
  );

  // ---------------------------
  // SELECTED IMAGE CLICK
  // ---------------------------
  const handleSelectedImageClick = useCallback(
    (imageId: number) => {
      if (selectedImages.includes(imageId)) {
        dispatch(playSound("select"));
        setAlertMessage("Do you want to change Selected Superhero?");
        setCurrentImageId(imageId);
        setModals((prev) => ({ ...prev, confirmChangeVisible: true }));
      }
    },
    [selectedImages, dispatch]
  );

  // ---------------------------
  // NAME CHANGE
  // ---------------------------
  const handleNameChange = useCallback((imageId: number, name: string) => {
    if (name.length > MAX_NAME_LENGTH) {
      setAlertMessage(`Name cannot exceed ${MAX_NAME_LENGTH} characters.`);
      setModals((prev) => ({ ...prev, modalVisible: true }));
      return;
    }

    setImageNamesState((prev) => ({ ...prev, [imageId]: name }));
  }, []);

  // ---------------------------
  // DEFAULT NAMES
  // ---------------------------
  const getDefaultNames = useCallback(
    (imageIds: number[], gameMode: GameMode | null) => {
      const usedNames = new Set<string>();

      return imageIds
        .map((id, index) => ({ id, index }))
        .reduce((acc, { id, index }) => {
          if (!imageNames[id] || imageNames[id].trim() === "") {
            acc[id] = generateRandomName(usedNames, gameMode, index);
          }
          return acc;
        }, {} as Record<number, string>);
    },
    [imageNames]
  );

  const checkForDuplicateNames = useCallback((): boolean => {
    const names = Object.values(imageNames).filter(
      (name) => name.trim() !== ""
    );
    return new Set(names).size !== names.length;
  }, [imageNames]);

  // ---------------------------
  // START GAME
  // ---------------------------
  const handleStartAdventure = useCallback(async () => {
    dispatch(playSound("select"));
    setIsButtonDisabled(true);

    try {
      if (checkForDuplicateNames()) {
        setAlertMessage("Please make sure each superhero has a unique name.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        return;
      }

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
      setAlertMessage("Something went wrong. Please try again.");
      setModals((prev) => ({ ...prev, modalVisible: true }));
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
  // MODAL HELPERS
  // ---------------------------
  const showGameInfo = useCallback(() => {
    dispatch(playSound("select"));
    setModals((prev) => ({ ...prev, infoModalVisible: true }));
  }, [dispatch]);

  const closeAlertModal = useCallback(() => {
    setModals((prev) => ({ ...prev, modalVisible: false }));
  }, []);

  const closeInfoAddMoreModal = useCallback(() => {
    setModals((prev) => ({ ...prev, infoAddMoreVisible: false }));
  }, []);

  // ---------------------------
  // CONFIRM REMOVE PLAYER
  // ---------------------------
  const handleAlertConfirm = useCallback(() => {
    dispatch(playSound("select"));

    if (currentImageId !== null) {
      setSelectedImagesState((prev) =>
        prev.filter((id) => id !== currentImageId)
      );

      setPlayerNamesState((prev) =>
        prev.filter((player) => player.id !== currentImageId)
      );

      setImageNamesState((prev) => {
        const { [currentImageId]: _, ...rest } = prev;
        return rest;
      });

      setCurrentImageId(null);
    }

    closeAlertModal();
    setModals((prev) => ({ ...prev, confirmChangeVisible: false }));
  }, [currentImageId, dispatch, closeAlertModal]);

  return {
    selectedImages,
    imageNames,
    handleImageSelect,
    handleSelectedImageClick,
    handleNameChange,
    handleStartAdventure,
    showGameInfo,
    closeAlertModal,
    closeInfoAddMoreModal,
    handleAlertConfirm,
    modalVisible: modals.modalVisible,
    infoModalVisible: modals.infoModalVisible,
    confirmChangeVisible: modals.confirmChangeVisible,
    infoAddMoreVisible: modals.infoAddMoreVisible,
    alertMessage,
    setInfoModalVisible: (visible: boolean) =>
      setModals((prev) => ({ ...prev, infoModalVisible: visible })),
    setConfirmChangeVisible: (visible: boolean) =>
      setModals((prev) => ({ ...prev, confirmChangeVisible: visible })),
    setModalVisible: (visible: boolean) =>
      setModals((prev) => ({ ...prev, modalVisible: visible })),
    setInfoAddMoreVisible: (visible: boolean) =>
      setModals((prev) => ({ ...prev, infoAddMoreVisible: visible })),
    setAlertMessage,
    isButtonDisabled,
  };
};
