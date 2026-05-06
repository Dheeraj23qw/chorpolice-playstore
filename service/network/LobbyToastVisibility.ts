type LobbyToastSession = {
  connectionStatus?: string | null;
  gamePhase?: string | null;
  lobbyStage?: string | null;
};

export const isLobbyPresenceToastAllowed = (
  session: LobbyToastSession,
) => {
  const isLobbyStage =
    session.lobbyStage === "room" || session.lobbyStage === "setup";

  return (
    session.connectionStatus !== "ERROR" &&
    session.gamePhase === "idle" &&
    isLobbyStage
  );
};
