// gameUtils.ts
import { Animated } from "react-native";

export const resetGame = (
  initialFlippedStates: boolean[],
  initialClickedCards: boolean[],
  initialFlipAnims: Animated.Value[],
  playerNames: string[],
  setFlipAnims: (value: Animated.Value[]) => void,
  setFlippedStates: (value: boolean[]) => void,
  setClickedCards: (value: boolean[]) => void,
  setSelectedPlayer: (value: number) => void,
  setIsPlayButtonDisabled: (value: boolean) => void,
  setRound: (value: number) => void,
  setMessage: (value: string) => void,
  setPoliceClickCount: (value: number) => void,
  setAdvisorIndex: (value: number | null) => void,
  setThiefIndex: (value: number | null) => void,
  setKingIndex: (value: number | null) => void,
  setPoliceIndex: (value: number | null) => void,
  setVideoIndex: (value: number) => void,
  setIsPlaying: (value: boolean) => void,
  setPlayerScores: (value: Array<{ playerName: string; scores: number[] }>) => void
) => {
  setFlipAnims(initialFlipAnims.map(() => new Animated.Value(0)));
  setFlippedStates(initialFlippedStates);
  setClickedCards(initialClickedCards);
  setSelectedPlayer(1);
  setIsPlayButtonDisabled(false);
  setRound(1);
  setMessage("");
  setPoliceClickCount(0);
  setAdvisorIndex(null);
  setThiefIndex(null);
  setKingIndex(null);
  setPoliceIndex(null);
  setVideoIndex(1);
  setIsPlaying(true);
  setPlayerScores(
    playerNames.map((name) => ({
      playerName: name,
      scores: Array.from({ length: 10 }, () => 0),
    }))
  );
};
