import { GameMode } from "@/types/redux/reducers";

const prefixes = [
    "cool", "star", "fair", "myst", "silly",
    "blue", "jump", "happy", "play", "wild",
    "bubb", "smok", "snap", "grow", "glow",
    "beam", "zest", "fizz", "dare", "wave",
    "quir", "milo", "blip", "yeti", "roar",
    "taco", "puff", "swoop", "zany", "fuzz",
    "wink", "sway", "hugz", "spark", "shine",
];

const suffixes = [
    "zyx", "jet", "fly", "pop", "fun",
    "joy", "max", "zap", "wig", "bun",
    "run", "hop", "gem", "bit", "sun",
];

const separators = [
    "_", "-", "~", "@", "#", "^",
];

export const generateRandomName = (usedNames: Set<string>, gameMode: GameMode | null,playerIndex:number): string => {
    let name = "";
   

    if (gameMode === "OFFLINE") {
        // Generate player names like player_1, player_2, etc.
        do {
            name = `player_${playerIndex+1}`;
        } while (usedNames.has(name)); // Ensure uniqueness
    } else if (gameMode === "OFFLINE_WITH_BOTS") {
        // Generate bot names like bot_1, bot_2, etc.
        do {
            name = `player_${playerIndex+1}`;
        } while (usedNames.has(name)); // Ensure uniqueness
    } else {
        do {
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            const separator = separators[Math.floor(Math.random() * separators.length)];
            name = `${prefix}${separator}${suffix}`;
        } while (usedNames.has(name)); // Ensure uniqueness
    }

    usedNames.add(name);
    return name;
};
