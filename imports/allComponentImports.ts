import ScreenHeader from "@/components/_screenHeader";
import FeedbackMessage from "@/components/chorPoliceQuiz/feedback";
import QuizOptions from "@/components/chorPoliceQuiz/option";
import PlayerInfo from "@/components/chorPoliceQuiz/playerInfo";
import QuestionBox from "@/components/chorPoliceQuiz/question";
import { ActionButtons } from "@/components/leaderBoardScreen/ActionButtons";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import LoadingIndicator from "@/components/LoadingIndicator";
import { PlayernameActionButtons } from "@/components/playerNameScreen/ActionButtons";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";
import OptionHeader from "@/components/optionHeader";
import { SelectedImageGrid } from "@/components/playerNameScreen/SelectedImageGrid";
import { AvatarSelectionMemo } from "@/components/playerNameScreen/toggleContainer";
import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";
import PlayButton from "@/components/RajamantriGameScreen/playButton";
import ScoreTable  from '@/components/RajamantriGameScreen/scoretable';
import VideoPlayerComponent from "@/components/RajamantriGameScreen/videoPlayer";


export const Components = {
  //chorPoliceQuiz components imports
  FeedbackMessage,
  QuizOptions,
  PlayerInfo,
  QuestionBox,

  //leaderBoardScreen components imports
  ActionButtons,
  Leaderboard,
  WinnerSection,

  //PlayernameScreen components imports
  PlayernameActionButtons,
  ImageGrid,
  OptionHeader,
  SelectedImageGrid,
  AvatarSelectionMemo,

  //RajamantriGameScreen components imports
  PlayerCard,
  PlayButton,
  ScoreTable,
  VideoPlayerComponent,

  //individual components imports
  LoadingIndicator,
  ScreenHeader,
};
