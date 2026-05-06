import { MODES, NETWORK } from "@/constants/Networking";
import { CPMultiplayerContext } from "./types";
import { handlePublicReveal } from "./revealHandlers";
import { handleRoundResult } from "./policeHandlers";
import { handleScoreQuizTurn, handleScoreGuess, handleScoreGuessResult } from "./quizHandlers";
import { handleGameEndCompleted } from "./economyHandlers";
import { handleGameEndExit, handlePlayerLeave } from "./sessionHandlers";

export const routePacket = (packet: any, sourceIp: string | undefined, context: CPMultiplayerContext) => {
  const CP = MODES.CHOR_POLICE;
  const _isHost = context.refs.isHostRef.current;

  if (!_isHost && sourceIp) {
    // @ts-ignore - reaching into refs for side effect
    context.refs.lastHostSignalAtRef = Date.now();
  }

  switch (packet.type) {
    case CP.ROLE_ASSIGN:
      if (packet.playerId === context.refs.localPlayerIdRef.current) {
        console.log("🎭 [PacketRouter] ROLE_ASSIGN received");
      }
      break;

    case CP.PUBLIC_REVEAL:
      handlePublicReveal(packet, context);
      break;

    case CP.ROUND_RESULT:
      handleRoundResult(packet, context);
      break;

    case CP.SCORE_QUIZ_TURN:
      handleScoreQuizTurn(packet, context);
      break;

    case CP.SCORE_GUESS:
      if (_isHost) handleScoreGuess(packet, context);
      break;

    case CP.SCORE_GUESS_RESULT:
      handleScoreGuessResult(packet, context);
      break;

    case CP.GAME_END:
      if (packet.reason === "completed") {
        handleGameEndCompleted(packet, context);
      } else {
        handleGameEndExit(packet, context);
      }
      break;

    case NETWORK.PLAYER_LEAVE:
      handlePlayerLeave(packet, context);
      break;

    default:
      // Unknown packet or handled elsewhere
      break;
  }
};
