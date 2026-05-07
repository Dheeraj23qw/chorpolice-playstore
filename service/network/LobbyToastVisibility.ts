type LobbyToastSession = {
  connectionStatus?: string | null;
  gamePhase?: string | null;
  lobbyStage?: string | null;
  gameType?: string | null;
  players?: unknown[] | null;
};

export const isLobbyPresenceToastAllowed = (
  session: LobbyToastSession,
) => {
  const isLobbyStage =
    session.lobbyStage === "room" || session.lobbyStage === "setup";
  const hasActiveLobbyPlayers =
    Array.isArray(session.players) && session.players.length > 1;

  return (
    session.connectionStatus !== "ERROR" &&
    session.gamePhase === "idle" &&
    isLobbyStage &&
    Boolean(session.gameType) &&
    hasActiveLobbyPlayers
  );
};
