import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import {
  setPlayerNames,
  setSelectedImages,
  setGameMode,
} from "@/redux/slices/playerSlice";
import { playSound } from "@/redux/slices/soundSlice";
import { RootState } from "@/redux/store";
import { GameMode } from "@/redux/slices/playerSlice";

const MAX_SELECTED_IMAGES = 4;
const MAX_NAME_LENGTH = 8;
const DEFAULT_PLAYER_NAME = "player_";

interface PlayerName {
  id: number;
  name: string;
  isBot: boolean;
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
  // New states for counting bots and humans
  const [botCount, setBotCount] = useState<number>(0);
  const [humanCount, setHumanCount] = useState<number>(0);

  const dispatch = useDispatch();
  const router = useRouter();

  // Use player images from Redux state
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
  );

  useEffect(() => {
    if (gameModeStatus !== null) {
      dispatch(setGameMode(gameModeStatus));
    }
  }, [gameModeStatus,dispatch]);

  const handleImageSelect = useCallback(
    (imageId: number, isBot: boolean, gameMode: GameMode) => {
      setGameModeStatus(gameMode);
  
      if (!playerImages[imageId]) {
        setAlertMessage("Selected image is not available.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        return;
      }
  
      if (isBot && botCount >= 3) {
        setAlertMessage("You can only select a maximum of 3 bots.please choose your Avatar to start the game");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        return;
      }
  
      // In non-OFFLINE modes, limit the human count to 3 and prompt user to add at least one bot
      if (gameMode !== "OFFLINE" && !isBot && humanCount >= 3) {
        setAlertMessage("Please choose at least one bot to start the game.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        return;
      }
  
      if (selectedImages.includes(imageId)) {
        setAlertMessage("You've already selected this superhero! Would you like to change it?");
        setCurrentImageId(imageId);
        setModals((prev) => ({ ...prev, confirmChangeVisible: true }));
        return;
      }
  
      if (selectedImages.length < MAX_SELECTED_IMAGES) {
        dispatch(playSound("level"));
  
        if (selectedImages.length === 0) {
          // Check if `gameModeStatus` is OFFLINE and show appropriate message
          const alertMsg =
            gameMode === "OFFLINE"
              ? "Add 3 more avatars to play"
              : "Add 3 more avatars (bots or humans) to complete your team of 4!";
          setAlertMessage(alertMsg);
          setModals((prev) => ({ ...prev, infoAddMoreVisible: true }));
        }
  
        setSelectedImagesState((prevSelectedImages) => [
          ...prevSelectedImages,
          imageId,
        ]);
  
        if (isBot) {
          setBotCount((prev) => prev + 1);
        } else {
          setHumanCount((prev) => prev + 1);
        }
  
        const newPlayer = { id: imageId, name: "", isBot };
        setPlayerNamesState((prevNames) => [...prevNames, newPlayer]);
  
        dispatch(setPlayerNames([...playerNames, newPlayer]));
      } else {
        setAlertMessage("You can only pick 4 superheroes.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
      }
    },
    [
      selectedImages,
      playerImages,
      dispatch,
      playerNames,
      gameModeStatus,
      botCount,
      humanCount, // Include humanCount in dependencies
    ]
  );
  
  

  const handleSelectedImageClick = useCallback(
    (imageId: number) => {
      if (selectedImages.includes(imageId)) {
        dispatch(playSound("select"));
        setAlertMessage(
          "This superhero is already selected. Do you want to change it?"
        );
        setCurrentImageId(imageId);
        setModals((prev) => ({ ...prev, confirmChangeVisible: true }));
      }
    },
    [selectedImages, dispatch]
  );

  const handleNameChange = useCallback((imageId: number, name: string) => {
    if (name.length > MAX_NAME_LENGTH) {
      setAlertMessage(`Name cannot exceed ${MAX_NAME_LENGTH} characters.`);
      setModals((prev) => ({ ...prev, modalVisible: true }));
      return;
    }

    setImageNamesState((prevNames) => ({ ...prevNames, [imageId]: name }));
  }, []);

  const getDefaultNames = useCallback(
    (imageIds: number[]): Record<number, string> => {
      return imageIds.reduce((acc, id, index) => {
        if (!imageNames[id] || imageNames[id].trim() === "") {
          acc[id] = `${DEFAULT_PLAYER_NAME}${index + 1}`;
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

  const handleStartAdventure = useCallback(async () => {
    setIsButtonDisabled(true); // Disable the button after click
    try {
      if (checkForDuplicateNames()) {
        setAlertMessage("Please make sure each superhero has a unique name.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        setIsButtonDisabled(false); // Re-enable button on error
        return;
      }

      const updatedImageNames = {
        ...imageNames,
        ...getDefaultNames(selectedImages),
      };
      const imagesWithDetails = selectedImages.map((id) => ({
        id,
        name: updatedImageNames[id],
        isBot: playerNames.find((player) => player.id === id)?.isBot || false, // Retrieve isBot status
      }));

      await dispatch(setSelectedImages(selectedImages));
      await dispatch(setPlayerNames(imagesWithDetails));
      router.push("/chorpolicegame");
    } catch (error) {
      console.error("Failed to start adventure:", error);
      if (error instanceof TypeError) {
        setAlertMessage(
          "There was an issue with the data provided. Please check and try again."
        );
      } else if (error instanceof Error) {
        setAlertMessage(`An error occurred: ${error.message}`);
      } else {
        setAlertMessage("An unexpected error occurred. Please try again.");
      }
      setModals((prev) => ({ ...prev, modalVisible: true }));
    } finally {
      setIsButtonDisabled(false); // Re-enable the button after task completion
    }
  }, [
    selectedImages,
    imageNames,
    getDefaultNames,
    checkForDuplicateNames,
    dispatch,
    router,
    playerNames,
  ]);

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

  const handleAlertConfirm = useCallback(() => {
    dispatch(playSound("select"));
    if (currentImageId !== null) {
      // Determine if the current image is a bot or human before removing it
      const currentPlayer = playerNames.find(
        (player) => player.id === currentImageId
      );
      if (currentPlayer) {
        // Decrement the corresponding count
        if (currentPlayer.isBot && botCount > 0) {
          setBotCount((prev) => prev - 1);
        } else if (!currentPlayer.isBot && humanCount > 0) {
          setHumanCount((prev) => prev - 1);
        }
      }

      setSelectedImagesState((prevSelectedImages) =>
        prevSelectedImages.filter((id) => id !== currentImageId)
      );
      setImageNamesState((prevNames) => {
        const { [currentImageId]: _, ...newNames } = prevNames;
        return newNames;
      });
      setCurrentImageId(null);
    }
    closeAlertModal();
    setModals((prev) => ({ ...prev, confirmChangeVisible: false }));
  }, [currentImageId, closeAlertModal, dispatch]);

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
    botCount, // Return bot count
    humanCount, // Return human count
  };
};
