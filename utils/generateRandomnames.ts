import { GameMode } from "@/types/redux/reducers";

/**
 * Generates a simple name like player_1, player_2, etc.
 * regardless of the game mode.
 */
export const generateRandomName = (
    usedNames: Set<string>, 
    gameMode: GameMode | null, 
    playerIndex: number
): string => {
    // Standardize naming: player_1, player_2, etc.
    const name = `player_${playerIndex + 1}`;

    usedNames.add(name);
    return name;
};