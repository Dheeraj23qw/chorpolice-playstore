/**
 * QuestionTranslator.ts
 * Robust translator for Think and Count quiz content.
 * Covers every generated question template and keeps option values stable.
 */

type NullableText = string | null | undefined;

export interface LocalizedQuizOption {
  label: string;
  value: string;
}

const ROLE_LABEL_MAP: Record<string, string> = {
  King: "Raja",
  Advisor: "Mantri",
  Police: "Police",
  Thief: "Chor",
};

const ROLE_SENTENCE_MAP: Record<string, string> = {
  King: "Raja",
  Advisor: "Mantri",
  Police: "Police",
  Thief: "Chor",
};

const RANK_MAP: Record<string, string> = {
  first: "first",
  second: "second",
  third: "third",
  fourth: "fourth",
};

const NUMBER_TYPE_MAP: Record<string, string> = {
  even: "even",
  odd: "odd",
  prime: "prime",
};

const EXACT_TRANSLATIONS: Record<string, string> = {
  True: "Sahi",
  False: "Galat",
  King: ROLE_LABEL_MAP.King,
  Advisor: ROLE_LABEL_MAP.Advisor,
  Police: ROLE_LABEL_MAP.Police,
  Thief: ROLE_LABEL_MAP.Thief,
};

const translationCache = new Map<string, string>();
const optionCache = new Map<string, LocalizedQuizOption[]>();

const toSentenceRole = (value: string) => ROLE_SENTENCE_MAP[value] || value;
const toOptionRole = (value: string) => ROLE_LABEL_MAP[value] || value;
const toRankHindi = (value: string) => RANK_MAP[value.toLowerCase()] || value;
const toNumberTypeHindi = (value: string) =>
  NUMBER_TYPE_MAP[value.toLowerCase()] || value;

const normalizeText = (text: string) =>
  text
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const applyFallbackTokenTranslations = (text: string) =>
  text
    .replace(/\b(True)\b/g, "Sahi")
    .replace(/\b(False)\b/g, "Galat")
    .replace(/\b(King|Advisor|Police|Thief)\b/g, (match) =>
      toSentenceRole(match),
    );

const HINDI_TEMPLATES = [
  {
    pattern: /Which player has a score of (\d+) at the end of round (\d+)\?/i,
    translate: ([, score, round]: RegExpMatchArray) =>
      `Round ${round} ke end me kis player ka score ${score} hai?`,
  },
  {
    pattern: /What is the total score of the ([^?]+?) at the end of round (\d+)\?/i,
    translate: ([, role, round]: RegExpMatchArray) =>
      `Round ${round} ke end me ${toSentenceRole(role)} ka total score kitna hai?`,
  },
  {
    pattern: /Who was at ([^ ]+) position at the end of round (\d+)\?/i,
    translate: ([, rank, round]: RegExpMatchArray) =>
      `Round ${round} ke end me ${toRankHindi(rank)} position par kaun tha?`,
  },
  {
    pattern: /Is ([^ ]+) at ([^ ]+) position after round (\d+)\?/i,
    translate: ([, role, rank, round]: RegExpMatchArray) =>
      `Kya Round ${round} ke baad ${toSentenceRole(role)} ${toRankHindi(rank)} position par hai?`,
  },
  {
    pattern: /Is the score of ([^ ]+) in round (\d+) divisible by (\d+)\?/i,
    translate: ([, role, round, divisor]: RegExpMatchArray) =>
      `Kya Round ${round} me ${toSentenceRole(role)} ka score ${divisor} se divisible hai?`,
  },
  {
    pattern: /Round off (\d+) to the nearest (\d+)\. What is the rounded-off score\?/i,
    translate: ([, score, step]: RegExpMatchArray) =>
      `${score} ko nearest ${step} tak round off karo. Rounded score kya hoga?`,
  },
  {
    pattern: /Is ([^']+)'s total score at the end of round (\d+) a[n]? (even|odd|prime) number\?/i,
    translate: ([, role, round, type]: RegExpMatchArray) =>
      `Kya Round ${round} ke end me ${toSentenceRole(role)} ka total score ${toNumberTypeHindi(type)} number hai?`,
  },
  {
    pattern: /What is the sum of ([^']+)'s and ([^']+)'s scores in round (\d+)\?/i,
    translate: ([, firstRole, secondRole, round]: RegExpMatchArray) =>
      `Round ${round} me ${toSentenceRole(firstRole)} aur ${toSentenceRole(secondRole)} ke score ka sum kya hai?`,
  },
  {
    pattern: /What is the absolute difference between ([^']+)'s and ([^']+)'s scores in round (\d+)\?/i,
    translate: ([, firstRole, secondRole, round]: RegExpMatchArray) =>
      `Round ${round} me ${toSentenceRole(firstRole)} aur ${toSentenceRole(secondRole)} ke score ka difference kitna hai?`,
  },
  {
    pattern: /What is the result of multiplying ([^']+)'s and ([^']+)'s scores in round (\d+)\?/i,
    translate: ([, firstRole, secondRole, round]: RegExpMatchArray) =>
      `Round ${round} me ${toSentenceRole(firstRole)} aur ${toSentenceRole(secondRole)} ke score multiply karne par result kya hoga?`,
  },
  {
    pattern: /No player is ranked ([^ ]+) at the end of round (\d+)\./i,
    translate: ([, rank, round]: RegExpMatchArray) =>
      `Round ${round} ke end me ${toRankHindi(rank)} position par koi player nahi tha.`,
  },
];

export const translateToHindi = (text: NullableText): string => {
  if (!text) return "";

  const normalized = normalizeText(text);
  const cached = translationCache.get(normalized);
  if (cached) {
    return cached;
  }

  for (const item of HINDI_TEMPLATES) {
    const match = normalized.match(item.pattern);
    if (match) {
      const translated = item.translate(match);
      translationCache.set(normalized, translated);
      return translated;
    }
  }

  const exactTranslation = EXACT_TRANSLATIONS[normalized];
  if (exactTranslation) {
    translationCache.set(normalized, exactTranslation);
    return exactTranslation;
  }

  const fallback = applyFallbackTokenTranslations(normalized);
  translationCache.set(normalized, fallback);
  return fallback;
};

export const translateOptionsToHindi = (options: string[] | null | undefined): string[] => {
  if (!options) return [];
  return options.map((option) => EXACT_TRANSLATIONS[option] || translateToHindi(option));
};

export const buildLocalizedQuizOptions = (
  options: string[] | null | undefined,
): LocalizedQuizOption[] => {
  const normalizedOptions = options || [];
  const cacheKey = normalizedOptions.join("||");
  const cached = optionCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const localized = normalizedOptions.map((value) => ({
    value,
    label: EXACT_TRANSLATIONS[value] || translateToHindi(value),
  }));

  optionCache.set(cacheKey, localized);
  return localized;
};
