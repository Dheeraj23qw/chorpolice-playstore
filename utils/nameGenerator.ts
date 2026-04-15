const FALLBACK_NAMES = [
  "Niraj",
  "Harshit",
  "Bitu",
  "Harsh",
  "Shubham",
  "Himanshu",
  "Sumit",
  "Saksham",
  "Ajay",
  "Vikash",
  "Kaushik",
  "Ankit",
  "Mukund",
  "Galib",
  "Sahil",
  "Bagdi",
  "Ankur",
];
let nameCache: string[] = [];

/**
 * Pre-fetches random names. Call this when entering the lobby.
 */
export const preloadBotNames = async (count: number = 20) => {
  try {
    const response = await fetch(
      `https://randomuser.me/api/?results=${count}&inc=name&noinfo&nat=us,gb,au`,
    );
    if (!response.ok) throw new Error("Network error");

    const data = await response.json();
    nameCache = data.results.map((u: any) => u.name.first);
  } catch (error) {
    console.warn(
      "⚠️ [NameUtil] Could not fetch names, falling back to defaults.",
    );
    nameCache = [...FALLBACK_NAMES];
  }
};

/**
 * Returns a name from the cache.
 * If index is out of bounds, it cycles through the fallback list.
 */
export const getBotName = (index: number): string => {
  if (nameCache.length > 0) {
    return nameCache[index] || FALLBACK_NAMES[index % FALLBACK_NAMES.length];
  }
  return FALLBACK_NAMES[index % FALLBACK_NAMES.length];
};
