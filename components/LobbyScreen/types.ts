import { DifficultyOption } from "@/constants/difficultyConfig";
import { SessionPlayer } from "@/redux/reducers/sessionSlice";

export interface LobbyPlayer extends SessionPlayer {}

export interface LobbyState {
  isHost: boolean;
  localPlayerId: string | null;
  gameType: string;
  lobbyStage: "room" | "setup";
  userName: string;
  players: LobbyPlayer[];
  roomCode: string | null;
  hostIp: string | null;
  connectionStatus: "IDLE" | "HOSTING" | "CONNECTED" | "CONNECTING" | "ERROR";
  errorMessage: string | null;
  localIp: string;
  isLocalOnlyLobby: boolean;
  selectedHostIp: string | null;
  localAvatarId: number;
  qrPayload: string;
  showAvatarGrid: boolean;
  setShowAvatarGrid: (show: boolean) => void;
  difficulty: string;
  selectedRounds: number;
  isBettingModalVisible: boolean;
  setIsBettingModalVisible: (visible: boolean) => void;
  selectedImages: number[];
  maxPlayers: number;
  handleDifficultyChange: (level: DifficultyOption) => void;
  handleConfirmStake: (stake: number) => void;
  handleAvatarSelect: (avatarId: number) => void;
  handleNameChange: (name: string) => void;
  handleBack: () => void;
  handleOpenSetup: () => void;
  handleBackToRoom: () => void;
  handleContinueWithReadySeats: () => void;
  handleRetryHosting: () => void;
  isBootstrappingHost: boolean;
  isTransitioning: boolean;
  showApIsolation: boolean;
  setShowApIsolation: (show: boolean) => void;
}
