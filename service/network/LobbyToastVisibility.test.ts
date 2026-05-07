import { isLobbyPresenceToastAllowed } from "./LobbyToastVisibility";

describe("isLobbyPresenceToastAllowed", () => {
  it("allows join toasts only while the lobby is active", () => {
    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "HOSTING",
        gamePhase: "idle",
        lobbyStage: "room",
        gameType: "CHOR_POLICE",
        players: [{ id: "host" }, { id: "bot-1" }],
      }),
    ).toBe(true);

    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "CONNECTED",
        gamePhase: "idle",
        lobbyStage: "setup",
        gameType: "CHOR_POLICE",
        players: [{ id: "host" }, { id: "guest" }],
      }),
    ).toBe(true);
  });

  it("suppresses join toasts outside the lobby", () => {
    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "CONNECTED",
        gamePhase: "waiting",
        lobbyStage: "room",
        gameType: "CHOR_POLICE",
        players: [{ id: "host" }, { id: "guest" }],
      }),
    ).toBe(false);

    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "ERROR",
        gamePhase: "idle",
        lobbyStage: "room",
        gameType: "CHOR_POLICE",
        players: [{ id: "host" }, { id: "guest" }],
      }),
    ).toBe(false);

    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "HOSTING",
        gamePhase: "idle",
        lobbyStage: "results",
        gameType: "CHOR_POLICE",
        players: [{ id: "host" }, { id: "guest" }],
      }),
    ).toBe(false);

    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "IDLE",
        gamePhase: "idle",
        lobbyStage: "room",
        gameType: null,
        players: [],
      }),
    ).toBe(false);
  });
});
