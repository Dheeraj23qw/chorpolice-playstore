export interface PlayerCardProps {
  index: number;
  role: string;
  playerName: string;
  flipped: boolean;
  clicked: boolean;
  isCorrect?: boolean;
  onClick: (index: number) => void;
  animatedStyle: any;
  onBounceEffect: (index: number) => void;
  isHighlight?: boolean;
  disabled?: boolean;
  highlightColor?: string;
}

export type PlayerImageData = {
  type: string;
  src: any;
};
