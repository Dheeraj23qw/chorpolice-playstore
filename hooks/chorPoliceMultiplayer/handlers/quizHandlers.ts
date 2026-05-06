import { CPMultiplayerContext } from "./types";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { AudioEngine } from "@/audio/audioEngine";
import { broadcastPacket } from "@/service/lanGameService";
import { MODES } from "@/constants/Networking";

export const handleScoreQuizTurn = (packet: any, context: CPMultiplayerContext) => {
  context.logic.scoreQuiz.handleScoreQuizTurnPacket(packet);
};

export const handleScoreGuess = (packet: any, context: CPMultiplayerContext) => {
  const { refs, logic } = context;
  const CP = MODES.CHOR_POLICE;

  if (refs.currentQuizPlayerIdRef.current !== packet.playerId) return;

  const players = logic.resolveScoreQuizPlayers();
  const playerIndex = players.findIndex((p) => p.id === packet.playerId);
  const player = players[playerIndex];
  const correctScore = ChorPoliceEngine.state.scores[player.id]?.totalScore ?? 0;
  const isCorrect = Number(packet.guessedScore) === correctScore;
  const bonus = isCorrect ? 2000 : -2000;

  ChorPoliceEngine.applyQuizBonus(player.id, bonus);

  broadcastPacket({
    type: CP.SCORE_GUESS_RESULT,
    playerId: player.id,
    playerIndex,
    guessedScore: packet.guessedScore,
    correctScore,
    isCorrect,
    bonus,
    leaderboard: ChorPoliceEngine.getLeaderboard(),
  });

  const nextTurnTimer = setTimeout(() => {
    logic.scoreQuiz.queueScoreQuizTurn(playerIndex + 1);
  }, 3800);
  refs.timerRefs.current.push(nextTurnTimer);
};

export const handleScoreGuessResult = (packet: any, context: CPMultiplayerContext) => {
  const { 
    refs, setQuizOptionDisabled, logic, setQuizPlayerIndex, setPlayerScores, 
    setMediaId, setMediaType, setPlayerData, setIsDynamicPopUp 
  } = context;

  if (refs.currentQuizPlayerIdRef.current !== packet.playerId) return;

  refs.currentQuizPlayerIdRef.current = null;
  refs.quizOptionDisabledRef.current = true;
  setQuizOptionDisabled(true);

  const players = logic.resolveScoreQuizPlayers();
  const pIdx = players.findIndex((p) => p.id === packet.playerId);
  setQuizPlayerIndex(pIdx >= 0 ? pIdx : packet.playerIndex);

  ChorPoliceEngine.syncScores(packet.leaderboard ?? []);

  setPlayerScores((prev) =>
    prev.map((entry) =>
      entry.playerId === packet.playerId
        ? { ...entry, scores: [...entry.scores, packet.bonus] }
        : entry
    )
  );

  const player = pIdx >= 0 ? players[pIdx] : undefined;
  const playerImage = refs.playerImagesRef.current[player?.avatarId ?? 1];

  AudioEngine.play(packet.isCorrect ? "win" : "lose", "gameplay");
  setMediaId(packet.isCorrect ? 2 : 1);
  setMediaType("gif");
  setPlayerData({
    image: playerImage?.src ?? null,
    message: packet.isCorrect ? "guessed correctly! +2000" : "guessed wrong! -2000",
    name: player?.name ?? "",
    imageType: playerImage?.type ?? null,
  });
  setIsDynamicPopUp(true);

  const pTimer = setTimeout(() => {
    if (pIdx < players.length - 1) {
      setIsDynamicPopUp(false);
    }
  }, 3800);
  refs.timerRefs.current.push(pTimer);
};
