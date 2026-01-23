
export interface GameState {
    flippedStates: boolean[];
    clickedCards: boolean[];
    selectedPlayer: number;
    message: string;
    roles: string[];
    isPlayButtonDisabled: boolean;
    policeClickCount: number;
    policePlayerName: string | null;
    policeIndex: number | null;
    kingIndex: number | null;
    advisorIndex: number | null;
    thiefIndex: number | null;
    playerScores: { playerName: string; scores: number[] }[];
    round: number;
    videoIndex: number;
    isPlaying: boolean;
    areCardsClickable: boolean;
    isModalVisible: boolean;
    popupIndex: number | null;
    firstCardClicked: boolean;
    isDynamicPopUp: boolean;
    mediaId: number;
    mediaType: "image" | "video" | "gif";
    playerData: PlayerData;
    isRoundStartPopupVisible: boolean;
    roundStartMessage: string;
  }



export interface PlayerData {
    image?: string | null;
    message?: string | null;
    imageType?: string | null;
  }

  // Define the PlayerScore interface
export interface PlayerScore {
    playerName: string;
    totalScore: number;
  }
  
  // Define the PlayerName interface with isBot as optional
  export interface PlayerName {
    id: number;
    name: string;
  }
  
  // Define the GameMode type
  export type GameMode = "OFFLINE" | "ONLINE";
  
  // Define the PlayerScoresByRound interface to store scores by round
  export interface PlayerScoresByRound {
    playerName: string;
    scores: number[];  
  }
  
  // Define the PlayerState interface
  export interface PlayerState {
    selectedImages: number[];
    playerNames: PlayerName[];
    playerScores: PlayerScore[];
    playerScoresByRound: PlayerScoresByRound[];  // New state for storing scores by round
    gameMode: GameMode;
    isGameReset: boolean, // New property to track if the game is reset
    gameRound: number, 
  }