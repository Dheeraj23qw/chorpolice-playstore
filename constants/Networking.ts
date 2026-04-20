/**
 * Universal Networking Constants
 * These apply to every game mode on the platform.
 */
/**
 * --- UPDATED NETWORKING CONSTANTS ---
 * WHY: Protocol v2.0.0 introduces Zeroconf discovery + TCP transport.
 *      Old UDP-based clients (v1.x) are cleanly rejected.
 */

export const NETWORK = {
  DISCOVERY_PORT: 41234,
  TCP_SERVER_PORT: 41235,
  BROADCAST_ADDRESS: "255.255.255.255",
  DISCOVERY_TIMEOUT: 5000,

  // PROTOCOL_VERSION: Bumped to 2.0.0 for the TCP transport migration.
  // v1.x (UDP) clients will be rejected at the envelope parse layer.
  PROTOCOL_VERSION: "2.0.0",

  // Zeroconf / mDNS Discovery
  ZEROCONF_SERVICE_TYPE: "chorpolice-game",
  ZEROCONF_PROTOCOL: "tcp",
  GAME_VERSION: "3.0.0",

  // Handshake Messages
  DISCOVERY_MSG: "PLATFORM_DISCOVERY",
  RESPONSE_MSG: "PLATFORM_RESPONSE",
  PLAYER_JOIN: "PLAYER_JOIN",
  PLAYER_JOIN_REJECT: "PLAYER_JOIN_REJECT",
  PLAYER_LEAVE: "PLAYER_LEAVE",
  PING: "PING",
  PONG: "PONG",

  // TCP Reconnection
  RECONNECT_ATTEMPTS: 3,
  RECONNECT_INTERVAL_MS: 1000,
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
