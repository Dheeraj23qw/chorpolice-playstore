/**
 * Universal Networking Constants
 * These apply to every game mode on the platform.
 */
/**
 * --- UPDATED NETWORKING CONSTANTS ---
 * WHY: Added PROTOCOL_VERSION to prevent crashes between different app versions.
 */

export const NETWORK = {
  DISCOVERY_PORT: 41234,
  TCP_SERVER_PORT: 41235,
  BROADCAST_ADDRESS: "255.255.255.255",
  DISCOVERY_TIMEOUT: 5000,

  // PROTOCOL_VERSION: This acts as a 'gatekeeper' for your network.
  // If this string doesn't match, the connection should be refused.
  PROTOCOL_VERSION: "1.0.0",

  // Handshake Messages
  DISCOVERY_MSG: "PLATFORM_DISCOVERY",
  RESPONSE_MSG: "PLATFORM_RESPONSE",
  PLAYER_JOIN: "PLAYER_JOIN",
  PLAYER_LEAVE: "PLAYER_LEAVE",
  PING: "PING",
  PONG: "PONG",
};

// ... keep your MODES and SESSION constants the same ...
/**
 * Game-Specific Protocol Constants
 * Clearly separated to keep your engines isolated.
 */
export const MODES = {
  CHOR_POLICE: {
    ID: "CHOR_POLICE",
    GAME_START:    "CP_GAME_START",
    GAME_END:      "CP_GAME_END",
    ROLE_ASSIGN:   "CP_ROLE_ASSIGN",      // Private: { playerId, role, playerIndex }
    PUBLIC_REVEAL: "CP_PUBLIC_REVEAL",    // Broadcast: { kingId, policeId, kingName, policeName, players }
    POLICE_GUESS:  "CP_POLICE_GUESS",    // Police clicks: { targetIndex, guessedRole }
    ROUND_RESULT:  "CP_ROUND_RESULT",    // Broadcast: { correct, scores, allRoles, round }
    ROUND_START:   "CP_ROUND_START",     // Broadcast: { round }
    SCORE_QUIZ_TURN: "CP_SCORE_QUIZ_TURN",
    SCORE_GUESS: "CP_SCORE_GUESS",
    SCORE_GUESS_RESULT: "CP_SCORE_GUESS_RESULT",
  },
  THINK_AND_COUNT: {
    ID: "THINK_AND_COUNT",
    GAME_START: "TC_GAME_START",
    GAME_END: "TC_GAME_END",
    ANSWER_PREFIX: "TC_ANSWER_",
    ANSWER_SUBMITTED: "TC_ANSWER_SUBMITTED",
    QUESTION_SYNC: "TC_QUESTION_SYNC",
    DIFFICULTY_CHANGE: "TC_DIFFICULTY_CHANGE",
    QUESTION_TIME_LIMIT: 10000,
  },
};

/**
 * UI & Session Constraints
 */
export const SESSION = {
  GLOBAL_TIMEOUT: 60000,
  POPUP_DELAY: 2000,
};
