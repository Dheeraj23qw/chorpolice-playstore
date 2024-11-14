export interface ScoreTableProps {
    playerNames: string[];
    playerScores: Array<{ playerName: string; scores: number[] }>;
    popupTable?: boolean; // Used to control whether the modal is shown
  }