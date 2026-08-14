type LobbyToastSession = {
  connectionStatus?: string | null;
  gamePhase?: string | null;
  lobbyStage?: string | null;
  gameType?: string | null;
  players?: unknown[] | null;
};

export const isLobbyPresenceToastAllowed = (
  _session: LobbyToastSession,
) => {
  // Presence toasts disabled (LateJoinQrModal host dashboard handles live monitoring)
  return false;
};
