import { isLobbyPresenceToastAllowed } from "./LobbyToastVisibility";

describe("isLobbyPresenceToastAllowed", () => {
  it("allows join toasts only while the lobby is active", () => {
    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "HOSTING",
        gamePhase: "idle",
        lobbyStage: "room",
      }),
    ).toBe(true);

    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "CONNECTED",
        gamePhase: "idle",
        lobbyStage: "setup",
      }),
    ).toBe(true);
  });

  it("suppresses join toasts outside the lobby", () => {
    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "CONNECTED",
        gamePhase: "waiting",
        lobbyStage: "room",
      }),
    ).toBe(false);

    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "ERROR",
        gamePhase: "idle",
        lobbyStage: "room",
      }),
    ).toBe(false);

    expect(
      isLobbyPresenceToastAllowed({
        connectionStatus: "HOSTING",
        gamePhase: "idle",
        lobbyStage: "results",
      }),
    ).toBe(false);
  });
});
