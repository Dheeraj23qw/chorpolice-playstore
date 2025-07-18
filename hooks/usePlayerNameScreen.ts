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
  const [botCount, setBotCount] = useState<number>(0);
  const [humanCount, setHumanCount] = useState<number>(0);

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

  const handleImageSelect = useCallback(
    (imageId: number, isBot: boolean, gameMode: GameMode) => {
      setGameModeStatus(gameMode);

      if (!playerImages[imageId]) {
        setAlertMessage("Selected image is not available.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        return;
      }

      if (isBot && botCount >= 3) {
        setAlertMessage("3 bots max. Select from player's Avatars");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        return;
      }

      if (gameMode !== "OFFLINE" && !isBot && humanCount >= 3) {
        setAlertMessage("Please choose at least one bot to start the game.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        return;
      }

      if (gameMode === "ONLINE_WITH_BOTS" && selectedImages.length >= 1) {
        setAlertMessage("You can only select one image in this mode.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        return;
      }

      if (selectedImages.includes(imageId)) {
        setAlertMessage("Do you want to change Selected Superhero?");
        setCurrentImageId(imageId);
        setModals((prev) => ({ ...prev, confirmChangeVisible: true }));
        return;
      }

      if (selectedImages.length < MAX_SELECTED_IMAGES) {
        dispatch(playSound("level"));

        if (selectedImages.length === 0) {
          let alertMsg = "";

          if (gameMode === "OFFLINE") {
            alertMsg = "Select 3 more avatars to play";
          } else if (gameMode === "OFFLINE_WITH_BOTS") {
            alertMsg = "Select 3 more avatars to play!";
          } else if (gameMode === "ONLINE_WITH_BOTS") {
            alertMsg = "image selected";
          }

          setAlertMessage(alertMsg);
          setModals((prev) => ({ ...prev, infoAddMoreVisible: true }));
        }

        if (gameMode === "ONLINE_WITH_BOTS" && selectedImages.length === 0) {
          const botImages = [];
          for (let i = 1; i <= 30; i++) {
            if (i !== imageId && !selectedImages.includes(i)) {
              botImages.push(i);
            }
          }

          const selectedBotImages = botImages
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

          setSelectedImagesState([imageId, ...selectedBotImages]);

          const botPlayers = selectedBotImages.map((botImageId) => ({
            id: botImageId,
            name: "",
            isBot: true,
          }));

          setPlayerNamesState([
            { id: imageId, name: "", isBot: false },
            ...botPlayers,
          ]);

          dispatch(
            setPlayerNames([
              { id: imageId, name: "", isBot: false },
              ...botPlayers,
            ])
          );

          return;
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
      humanCount,
    ]
  );

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

  const handleNameChange = useCallback((imageId: number, name: string) => {
    if (name.length > MAX_NAME_LENGTH) {
      setAlertMessage(`Name cannot exceed ${MAX_NAME_LENGTH} characters.`);
      setModals((prev) => ({ ...prev, modalVisible: true }));
      return;
    }

    setImageNamesState((prevNames) => ({ ...prevNames, [imageId]: name }));
  }, []);

  const getDefaultNames = useCallback(
    (imageIds: number[], gameMode: GameMode | null): Record<number, string> => {
      const usedNames = new Set<string>(); // Keep track of used names to ensure uniqueness
      return imageIds.map((id, index) => ({ id, index })).reduce((acc, { id, index }) => {
        if (!imageNames[id] || imageNames[id].trim() === "") {
          acc[id] = generateRandomName(usedNames, gameMode, index); // Pass gameMode and index to name generation
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
    dispatch(playSound("select"));
    setIsButtonDisabled(true);
    try {
      if (checkForDuplicateNames()) {
        setAlertMessage("Please make sure each superhero has a unique name.");
        setModals((prev) => ({ ...prev, modalVisible: true }));
        setIsButtonDisabled(false);
        return;
      }

      const updatedImageNames = {
        ...imageNames,
        ...getDefaultNames(selectedImages, gameModeStatus),
      };
      const imagesWithDetails = selectedImages.map((id) => ({
        id,
        name: updatedImageNames[id],
        isBot: playerNames.find((player) => player.id === id)?.isBot || false,
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
      setIsButtonDisabled(false);
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
      const currentPlayer = playerNames.find(
        (player) => player.id === currentImageId
      );
      if (currentPlayer) {
        if (currentPlayer.isBot && botCount > 0) {
          setBotCount((prev) => prev - 1);
        } else if (!currentPlayer.isBot && humanCount > 0) {
          setHumanCount((prev) => prev - 1);
        }
      }

      if (gameModeStatus === "ONLINE_WITH_BOTS" && !currentPlayer?.isBot) {
        setSelectedImagesState([]);
        setPlayerNamesState([]);
        setImageNamesState({});
        return;
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
  }, [
    currentImageId,
    playerNames,
    botCount,
    humanCount,
    gameModeStatus,
    dispatch,
    closeAlertModal,
  ]);

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
    botCount,
    humanCount,
  };
};
