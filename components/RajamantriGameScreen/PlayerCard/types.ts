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
  isLocalPlayer?: boolean;
  disabled?: boolean;
  highlightColor?: string;
  /** When true, a clicked-but-unflipped card is dimmed to 40% opacity. */
  dimWhenClicked?: boolean;
}

export type PlayerImageData = {
  type: string;
  src: any;
};
