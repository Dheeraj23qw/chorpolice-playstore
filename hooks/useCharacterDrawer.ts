import { useState, useCallback, useRef } from "react";
import { ImageSourcePropType } from "react-native";
import {
  CharacterDrawerContext,
  getRandomCharacterDrawerPick,
} from "@/constants/characterDrawerData";

// ─── Module-level flag: resets when JS runtime restarts ─────────────────────
let hasShownHome = false;

interface UseCharacterDrawerResult {
  message: string;
  avatarSource: ImageSourcePropType;
  shouldShow: boolean;
  dismiss: () => void;
}

/**
 * Picks a random message + random character for the given context.
 *
 * • `home`            → shows once per app launch, then hides after dismiss().
 * • `single_player`   → always shows (persistent).
 * • `multiplayer`     → always shows (persistent).
 */
export function useCharacterDrawer(
  context: CharacterDrawerContext,
): UseCharacterDrawerResult {
  // Freeze the random picks so they don't change on re-renders
  const picksRef = useRef(getRandomCharacterDrawerPick(context));

  const [visible, setVisible] = useState<boolean>(() => {
    if (context === "home") {
      // Only show if it hasn't been shown yet this launch
      return !hasShownHome;
    }
    // Single Player / Multiplayer: always show
    return true;
  });

  const dismiss = useCallback(() => {
    if (context === "home") {
      hasShownHome = true;
    }
    setVisible(false);
  }, [context]);

  return {
    message: picksRef.current.message,
    avatarSource: picksRef.current.avatarSource,
    shouldShow: visible,
    dismiss,
  };
}
