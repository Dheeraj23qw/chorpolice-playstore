import { SessionPlayer } from "@/redux/reducers/sessionSlice";
import { getBotName } from "@/utils/nameGenerator";

const TOTAL_PLAYERS = 4;
const BOT_START_INDEX = 1;
const AVATAR_POOL = Array.from({ length: 13 }, (_, index) => index + 1);

const getNextAvailableAvatar = (usedAvatarIds: Set<number>) => {
  const available = AVATAR_POOL.filter((id) => !usedAvatarIds.has(id));
  if (available.length === 0) return 1;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
};

const createBotPlayer = (
  slotIndex: number,
  usedAvatarIds: Set<number>,
  usedNames: Set<string>,
): SessionPlayer => {
  const avatarId = getNextAvailableAvatar(usedAvatarIds);
  usedAvatarIds.add(avatarId);

  let name = getBotName(Math.floor(Math.random() * 100));
  // Ensure name is unique among bots and players
  let attempt = 0;
  while (usedNames.has(name) && attempt < 10) {
    name = getBotName(Math.floor(Math.random() * 100) + attempt);
    attempt++;
  }
  usedNames.add(name);

  return {
    id: `bot_${slotIndex}_${Date.now()}`, // Unique ID even if replaced
    name,
    avatarId,
    isBot: true,
    coins: 9999999,
  };
};

export const createInitialLobbyPlayers = (hostPlayer: {
  id: string;
  name: string;
  avatarId: number;
  coins: number;
}): SessionPlayer[] => {
  const usedAvatarIds = new Set<number>([hostPlayer.avatarId]);
  const usedNames = new Set<string>([hostPlayer.name]);
  const players: SessionPlayer[] = [
    {
      ...hostPlayer,
      isBot: false,
    },
  ];

  for (let slotIndex = BOT_START_INDEX; slotIndex < TOTAL_PLAYERS; slotIndex += 1) {
    players.push(createBotPlayer(slotIndex, usedAvatarIds, usedNames));
  }

  return players;
};

export const replaceFirstBotWithPlayer = (
  players: SessionPlayer[],
  joiningPlayer: SessionPlayer,
): SessionPlayer[] | null => {
  const existingIndex = players.findIndex((player) => player.id === joiningPlayer.id);

  let nextPlayers = [...players];
  if (existingIndex >= 0) {
    nextPlayers[existingIndex] = {
      ...nextPlayers[existingIndex],
      ...joiningPlayer,
      isBot: false,
    };
  } else {
    const botIndex = players.findIndex((player, index) => index > 0 && player.isBot);
    if (botIndex < 0) return null;
    nextPlayers[botIndex] = {
      ...joiningPlayer,
      isBot: false,
    };
  }

  // 🔥 SMART CONFLICT RESOLUTION
  // Ensure NO other bots have the same avatar or name as humans
  const humanAvatars = new Set(nextPlayers.filter(p => !p.isBot).map(p => p.avatarId));
  const humanNames = new Set(nextPlayers.filter(p => !p.isBot).map(p => p.name));
  
  // Track all used attributes to ensure bots are also unique from each other
  const usedAvatars = new Set(humanAvatars);
  const usedNames = new Set(humanNames);

  return nextPlayers.map((player, idx) => {
    if (!player.isBot) return player;

    // If this bot conflicts with a human (or previous bot), re-randomize
    if (usedAvatars.has(player.avatarId) || usedNames.has(player.name)) {
      return createBotPlayer(idx, usedAvatars, usedNames);
    }

    usedAvatars.add(player.avatarId);
    usedNames.add(player.name);
    return player;
  });
};

export const replacePlayerWithBot = (
  players: SessionPlayer[],
  playerId: string,
): SessionPlayer[] => {
  const playerIndex = players.findIndex((player) => player.id === playerId);

  if (playerIndex <= 0) {
    return players;
  }

  const usedAvatars = new Set(
    players
      .filter((_, index) => index !== playerIndex)
      .map((player) => player.avatarId),
  );
  const usedNames = new Set(
    players
      .filter((_, index) => index !== playerIndex)
      .map((player) => player.name),
  );

  const nextPlayers = [...players];
  nextPlayers[playerIndex] = createBotPlayer(playerIndex, usedAvatars, usedNames);
  return nextPlayers;
};

const normalizeLobbyPlayers = (players: SessionPlayer[]): SessionPlayer[] => {
  if (players.length >= TOTAL_PLAYERS) {
    return players.slice(0, TOTAL_PLAYERS);
  }

  const usedAvatarIds = new Set(players.map((player) => player.avatarId));
  const usedNames = new Set(players.map((player) => player.name));
  const nextPlayers = [...players];

  for (let index = players.length; index < TOTAL_PLAYERS; index += 1) {
    nextPlayers.push(createBotPlayer(index, usedAvatarIds, usedNames));
  }

  return nextPlayers;
};
