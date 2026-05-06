/**
 * QuestionTranslator.ts
 * Lightweight translator for Think and Count questions.
 * Handles pattern-based regex translation for dynamic questions.
 */

const ROLE_MAP: Record<string, string> = {
  King: "King (राजा)",
  Advisor: "Advisor (मंत्री)",
  Police: "Police (सिपाही)",
  Thief: "Thief (चोर)",
};

const RANK_MAP: Record<string, string> = {
  first: "1st (पहले)",
  second: "2nd (दूसरे)",
  third: "3rd (तीसरे)",
  fourth: "4th (चौथे)",
};

const HINDI_TEMPLATES = [
  {
    // ScoreQuestion: Which player has a score of 50 at the end of round 3?
    pattern: /Which player has a score of (\d+) at the end of round (\d+)\?/i,
    translate: (match: string[]) => `Round ${match[2]} के अंत में किस Player का Score ${match[1]} है?`,
  },
  {
    // PlayerPositionBooleanQuestion: Is Police at second position after round 3?
    pattern: /Is ([^ ]+) at ([^ ]+) position after round (\d+)\?/i,
    translate: (match: string[]) => {
      const role = ROLE_MAP[match[1]] || match[1];
      const rank = RANK_MAP[match[2]] || match[2];
      return `क्या ${role} Round ${match[3]} के बाद ${rank} Position पर है?`;
    },
  },
  {
    // RandomPositionQuestion: Who was at first position at the end of round 3?
    pattern: /Who was at ([^ ]+) position at the end of round (\d+)\?/i,
    translate: (match: string[]) => {
      const rank = RANK_MAP[match[1]] || match[1];
      return `Round ${match[2]} के अंत में ${rank} Position पर कौन था?`;
    },
  },
  {
    // DivisibilityQuestion: Is the score of Police in round 3 divisible by 2?
    pattern: /Is the score of ([^ ]+) in round (\d+) divisible by (\d+)\?/i,
    translate: (match: string[]) => {
      const role = ROLE_MAP[match[1]] || match[1];
      return `क्या Round ${match[2]} में ${role} का Score ${match[3]} से Divisible है?`;
    },
  },
  {
    // RoundOffQuestion: Round off 45 to the nearest 10. What is the rounded-off score?
    pattern: /Round off (\d+) to the nearest (\d+)\. What is the rounded-off score\?/i,
    translate: (match: string[]) => `${match[1]} को निकटतम ${match[2]} तक Round off करें। Rounded-off Score क्या है?`,
  },
  {
    // TrueFalse Patterns (Even/Odd/Prime)
    pattern: /Is ([^']+)'s total score at the end of round (\d+) an (even|odd|prime) number\?/i,
    translate: (match: string[]) => {
      const role = ROLE_MAP[match[1]] || match[1];
      const typeMap: Record<string, string> = {
        even: "Even (सम)",
        odd: "Odd (विषम)",
        prime: "Prime (अभाज्य)",
      };
      return `क्या Round ${match[2]} के अंत में ${role} का कुल Score एक ${typeMap[match[3]] || match[3]} संख्या है?`;
    },
  },
];

export const translateToHindi = (text: string): string => {
  if (!text) return text;

  for (const item of HINDI_TEMPLATES) {
    const match = text.match(item.pattern);
    if (match) {
      return item.translate(match);
    }
  }

  // Fallback for True/False options
  if (text === "True") return "सही";
  if (text === "False") return "गलत";

  // Fallback for roles in options
  if (ROLE_MAP[text]) return ROLE_MAP[text];

  return text;
};

export const translateOptionsToHindi = (options: string[]): string[] => {
  if (!options) return options;
  return options.map(translateToHindi);
};
