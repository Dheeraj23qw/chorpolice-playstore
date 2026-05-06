import { CPMultiplayerContext } from "./types";
import { setPlayerNames as setReduxPlayerNames } from "@/redux/reducers/playerReducer";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";

export const handlePublicReveal = (packet: any, context: CPMultiplayerContext) => {
  const { setPlayerNames, setPlayerScores, setIsPlayButtonDisabled, dispatch, logic, refs } = context;
  const { setScoreQuizPlayersSnapshot } = logic;

  // 🛡️ Timer Safety: Clear any existing timers before starting a new reveal sequence
  refs.timerRefs.current.forEach(clearTimeout);
  refs.timerRefs.current = [];

  const names = packet.players.map((p: any) => p.name);

  refs.roundStartPendingRef.current = false;
  
  setPlayerNames(names);
  setScoreQuizPlayersSnapshot(
    ChorPoliceEngine.state.players.map((player) => ({
      id: player.id,
      name: player.name,
      avatarId: player.avatarId,
      isBot: player.isBot,
    }))
  );

  dispatch(
    setReduxPlayerNames(
      packet.players.map((player: any) => ({
        id: player.id,
        name: player.name,
        avatarId: player.avatarId,
      }))
    )
  );

  if (packet.round === 1) {
    setPlayerScores(
      packet.players.map((player: any) => ({
        playerId: player.id,
        playerName: player.name,
        scores: [],
      }))
    );
  }

  setIsPlayButtonDisabled(true);
  logic.revealSequence.triggerRevealSequence(packet);
};
