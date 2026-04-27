import { SessionPlayer } from "@/redux/reducers/sessionSlice";
import { getBotName } from "@/utils/nameGenerator";

const TOTAL_PLAYERS = 4;
const BOT_START_INDEX = 1;
const AVATAR_POOL = Array.from({ length: 13 }, (_, index) => index + 1);

const getNextAvailableAvatar = (usedAvatarIds: Set<number>) => {
  const nextAvatar = AVATAR_POOL.find((avatarId) => !usedAvatarIds.has(avatarId));
  return nextAvatar ?? 1;
};

export const createBotPlayer = (
  slotIndex: number,
  usedAvatarIds: Set<number>,
): SessionPlayer => {
  const avatarId = getNextAvailableAvatar(usedAvatarIds);
  usedAvatarIds.add(avatarId);

  return {
    id: `bot_${slotIndex}`,
    name: getBotName(Math.max(0, slotIndex - BOT_START_INDEX)),
    avatarId,
    isBot: true,
    coins: 9999999, // Bots have unlimited money
  };
};

export const createInitialLobbyPlayers = (hostPlayer: {
  id: string;
  name: string;
  avatarId: number;
  coins: number;
}): SessionPlayer[] => {
  const usedAvatarIds = new Set<number>([hostPlayer.avatarId]);
  const players: SessionPlayer[] = [
    {
      ...hostPlayer,
      isBot: false,
    },
  ];

  for (let slotIndex = BOT_START_INDEX; slotIndex < TOTAL_PLAYERS; slotIndex += 1) {
    players.push(createBotPlayer(slotIndex, usedAvatarIds));
  }

  return players;
};

export const replaceFirstBotWithPlayer = (
  players: SessionPlayer[],
  joiningPlayer: SessionPlayer,
): SessionPlayer[] | null => {
  const existingIndex = players.findIndex((player) => player.id === joiningPlayer.id);

  if (existingIndex >= 0) {
    const nextPlayers = [...players];
    nextPlayers[existingIndex] = {
      ...nextPlayers[existingIndex],
      ...joiningPlayer,
      isBot: false,
    };
    return nextPlayers;
  }

  const botIndex = players.findIndex((player, index) => index > 0 && player.isBot);

  if (botIndex < 0) {
    return null;
  }

  const nextPlayers = [...players];
  nextPlayers[botIndex] = {
    ...joiningPlayer,
    isBot: false,
  };
  return nextPlayers;
};

export const replacePlayerWithBot = (
  players: SessionPlayer[],
  playerId: string,
): SessionPlayer[] => {
  const playerIndex = players.findIndex((player) => player.id === playerId);

  if (playerIndex <= 0) {
    return players;
  }

  const usedAvatarIds = new Set(
    players
      .filter((_, index) => index !== playerIndex)
      .map((player) => player.avatarId),
  );

  const nextPlayers = [...players];
  nextPlayers[playerIndex] = createBotPlayer(playerIndex, usedAvatarIds);
  return nextPlayers;
};

export const normalizeLobbyPlayers = (players: SessionPlayer[]): SessionPlayer[] => {
  if (players.length >= TOTAL_PLAYERS) {
    return players.slice(0, TOTAL_PLAYERS);
  }

  const usedAvatarIds = new Set(players.map((player) => player.avatarId));
  const nextPlayers = [...players];

  for (let index = players.length; index < TOTAL_PLAYERS; index += 1) {
    nextPlayers.push(createBotPlayer(index, usedAvatarIds));
  }

  return nextPlayers;
};
