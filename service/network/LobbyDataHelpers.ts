import { NETWORK } from "@/constants/Networking";
import { SessionPlayer } from "@/redux/reducers/sessionSlice";

export const buildJoinPacket = (state: any, walletCoins: number) => {
  if (!state.localPlayerId) return null;
  return {
    type: NETWORK.PLAYER_JOIN,
    roomCode: state.roomCode,
    player: {
      id: state.localPlayerId,
      name: (state.localPlayerName || "User").trim(),
      avatarId: state.localAvatarId || 1,
      isBot: false,
      coins: walletCoins,
      deviceId: state.deviceId,
    },
  };
};

export const sanitizeJoiningPlayer = (
  player: Partial<SessionPlayer> | undefined,
  fallbackId: string,
  humanIndex: number = 1
): SessionPlayer => ({
  id: player?.id || fallbackId,
  name: player?.name?.trim() || `PLAYER_${humanIndex}`,
  avatarId: typeof player?.avatarId === "number" && player.avatarId > 0 ? player.avatarId : 1,
  isBot: Boolean(player?.isBot),
  coins: typeof player?.coins === "number" ? player.coins : 0,
});

export const checkLobbyDataChanged = (existing: SessionPlayer, incoming: SessionPlayer): boolean => {
  return (
    existing.name !== incoming.name ||
    existing.avatarId !== incoming.avatarId ||
    existing.coins !== incoming.coins
  );
};
