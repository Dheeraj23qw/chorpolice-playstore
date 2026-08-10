import { CardDealPreset } from "@/redux/reducers/sessionSlice";

export type DealingStage = "idle" | "spin" | "fade" | "reveal";

export type InvestigationTarget = {
  id: string;
  playerIndex: number | null;
  role: string;
  playerName?: string | null;
  playerAvatarId?: number | null;
};

export interface GamePlaySectionProps {
  isPlayButtonDisabled: boolean;
  handlePlay: () => void;
  roles: string[];
  playerNames: string[];
  flippedStates: boolean[];
  clickedCards: boolean[];
  handleCardClick: (index: number, targetId?: string) => void;
  handleCardClickWithBounce: (index: number) => void;
  toggleModal: () => void;
  round: number;
  message: string | null;
  countdown?: number | null;
  getCardStyle: (index: number) => any;
  showTableButton: boolean;
  isHighlight?: boolean;
  invisibleIndices?: number[];
  localPlayerName?: string;
  localPlayerIndex?: number;
  myRole?: string | null;
  gamePhase?: string;
  investigationTargets?: InvestigationTarget[];
  popupIndex?: number | null;
  dealAnimationPreset?: CardDealPreset;
  mysteryRevealStep?: number;
}
