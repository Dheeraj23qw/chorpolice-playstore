jest.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useRef: (value: unknown) => ({ current: value }),
}));

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
}));

jest.mock("@/redux/reducers/sessionSlice", () => ({
  setGamePhase: jest.fn((phase: string) => ({ type: "session/setGamePhase", payload: phase })),
}));

jest.mock("@/service/lanGameService", () => ({
  broadcastPacket: jest.fn(),
}));

jest.mock("@/service/ChorPoliceEngine", () => {
  const scores: Record<string, any> = {};

  return {
    ChorPoliceEngine: {
      state: { scores },
      applyQuizBonus: jest.fn((playerId: string, bonus: number) => {
        scores[playerId].level2Bonus += bonus;
        scores[playerId].totalScore += bonus;
      }),
      endGame: jest.fn(),
      getLeaderboard: jest.fn(() => Object.values(scores)),
    },
  };
});

import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { broadcastPacket } from "@/service/lanGameService";
import { useCPScoreQuiz } from "./useCPScoreQuiz";

const players = [
  { id: "p1", name: "P1", avatarId: 1 },
  { id: "p2", name: "P2", avatarId: 2 },
  { id: "p3", name: "P3", avatarId: 3 },
  { id: "p4", name: "P4", avatarId: 4 },
];

const asRef = <T,>(current: T) => ({ current });

const resetEngine = () => {
  const scores = ChorPoliceEngine.state.scores as Record<string, any>;
  Object.keys(scores).forEach((id) => delete scores[id]);
  players.forEach((player, index) => {
    scores[player.id] = {
      id: player.id,
      name: player.name,
      avatarId: player.avatarId,
      totalScore: (index + 1) * 1_000,
      roundScores: [],
      level2Bonus: 0,
    };
  });
};

const createQuiz = (isHost = true, quizPlayers = players) => {
  const setters = {
    setQuizCountdown: jest.fn(),
    setShowQuizLeaderboard: jest.fn(),
    setIsQuizRoundComplete: jest.fn(),
    setHasGuessedThisRound: jest.fn(),
    setBoostScoreModalVisible: jest.fn(),
    setQuizDone: jest.fn(),
    setQuizOptionDisabled: jest.fn(),
    setQuizPlayerIndex: jest.fn(),
    setQuizOptions: jest.fn(),
  };

  const api = useCPScoreQuiz({
    isHostRef: asRef(isHost),
    timerRefs: asRef<ReturnType<typeof setTimeout>[]>([]),
    currentQuizPlayerIdRef: asRef<string | null>(null),
    scoreQuizStartedRef: asRef(false),
    quizOptionDisabledRef: asRef(false),
    quizResponseSubmittedRef: asRef(false),
    correctScoreRef: asRef(0),
    resolveScoreQuizPlayers: () => quizPlayers,
    ...setters,
  });

  return { api, setters };
};

const packetsOfType = (type: string) =>
  (broadcastPacket as jest.Mock).mock.calls
    .map(([packet]) => packet)
    .filter((packet) => packet.type === type);

const startQuestion = (api: ReturnType<typeof useCPScoreQuiz>, questionIndex = 0) => {
  expect(api.queueScoreQuizTurn(questionIndex)).toBe(true);
  const packet = packetsOfType("CP_SCORE_QUIZ_TURN").at(-1);
  expect(api.handleScoreQuizTurnPacket(packet)).toBe(true);
  return packet;
};

const completeQuestion = (
  api: ReturnType<typeof useCPScoreQuiz>,
  turnPacket: any,
) => {
  players
    .filter((player) => player.id !== turnPacket.targetPlayerId)
    .forEach((player) => {
      api.collectGuess(
        player.id,
        turnPacket.correctScore,
        turnPacket.roundId,
        turnPacket.targetPlayerId,
      );
    });

  const result = packetsOfType("CP_SCORE_GUESS_RESULT").at(-1);
  expect(api.handleScoreQuizResultPacket(result)).toBe(true);
  return result;
};

describe("useCPScoreQuiz round lifecycle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    resetEngine();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("holds the round until every eligible player completes, then advances only once", () => {
    const { api, setters } = createQuiz();
    const turn = startQuestion(api);

    api.collectGuess("p2", turn.correctScore, turn.roundId, turn.targetPlayerId);
    api.collectGuess("p3", turn.correctScore, turn.roundId, turn.targetPlayerId);
    expect(packetsOfType("CP_SCORE_GUESS_RESULT")).toHaveLength(0);

    api.collectGuess("p4", turn.correctScore, turn.roundId, turn.targetPlayerId);
    const result = packetsOfType("CP_SCORE_GUESS_RESULT")[0];
    expect(result.completedPlayerIds).toEqual(players.map((player) => player.id));
    expect(api.handleScoreQuizResultPacket(result)).toBe(true);
    expect(setters.setIsQuizRoundComplete).toHaveBeenCalledWith(true);

    expect(api.advanceScoreQuiz()).toBe(true);
    expect(api.advanceScoreQuiz()).toBe(false);
    expect(packetsOfType("CP_SCORE_QUIZ_TURN")).toHaveLength(2);
  });

  it("marks missing answers as timed out when the host deadline expires", () => {
    const { api, setters } = createQuiz();
    startQuestion(api);

    jest.advanceTimersByTime(7_000);

    const result = packetsOfType("CP_SCORE_GUESS_RESULT")[0];
    expect(result.playerResults.filter((entry: any) => !entry.isTarget)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ playerId: "p2", timedOut: true }),
        expect.objectContaining({ playerId: "p3", timedOut: true }),
        expect.objectContaining({ playerId: "p4", timedOut: true }),
      ]),
    );
    expect(api.handleScoreQuizResultPacket(result)).toBe(true);
    expect(setters.setIsQuizRoundComplete).toHaveBeenCalledWith(true);
  });

  it("submits bot answers after about three seconds instead of the full deadline", () => {
    const botPlayers = [
      players[0],
      players[1],
      { ...players[2], isBot: true },
      { ...players[3], isBot: true },
    ];
    jest.spyOn(Math, "random").mockReturnValue(0);
    const { api } = createQuiz(true, botPlayers);
    const turn = startQuestion(api);

    api.collectGuess("p2", turn.correctScore, turn.roundId, turn.targetPlayerId);
    jest.advanceTimersByTime(2_499);
    expect(packetsOfType("CP_SCORE_GUESS_RESULT")).toHaveLength(0);

    jest.advanceTimersByTime(1);
    expect(packetsOfType("CP_SCORE_GUESS_RESULT")).toHaveLength(1);
  });

  it("runs exactly four synchronized questions and ends after Q4", () => {
    const { api } = createQuiz();
    let turn = startQuestion(api);

    for (let questionIndex = 0; questionIndex < 4; questionIndex += 1) {
      completeQuestion(api, turn);

      if (questionIndex < 3) {
        expect(api.advanceScoreQuiz()).toBe(true);
        turn = packetsOfType("CP_SCORE_QUIZ_TURN").at(-1);
        expect(turn.questionIndex).toBe(questionIndex + 1);
        expect(api.handleScoreQuizTurnPacket(turn)).toBe(true);
      }
    }

    expect(packetsOfType("CP_SCORE_QUIZ_TURN")).toHaveLength(4);
    expect(api.advanceScoreQuiz()).toBe(true);
    expect(ChorPoliceEngine.endGame).toHaveBeenCalledTimes(1);
    expect(api.queueScoreQuizTurn(4)).toBe(false);
  });

  it("does not permit a non-host to create or advance a round", () => {
    const { api } = createQuiz(false);

    expect(api.queueScoreQuizTurn(0)).toBe(false);
    expect(api.advanceScoreQuiz()).toBe(false);
    expect(broadcastPacket).not.toHaveBeenCalled();
  });
});
