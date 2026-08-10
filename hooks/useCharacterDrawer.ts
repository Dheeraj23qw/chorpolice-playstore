import { useState, useCallback, useRef } from "react";
import { ImageSourcePropType } from "react-native";
import {
  CharacterDrawerContext,
  getRandomCharacterDrawerPick,
} from "@/constants/characterDrawerData";

interface UseCharacterDrawerResult {
  message: string;
  avatarSource: ImageSourcePropType;
  shouldShow: boolean;
  dismiss: () => void;
  show: () => void;
}

/**
 * Picks a random message + random character for the given context.
 *
 * • `home`            → visibility is screen-controlled: call show() to
 *                        (re)display it (e.g. on each Home focus); it auto-
 *                        hides via the CharacterDrawer's autoHide.
 * • `single_player`   → always shows (persistent).
 * • `multiplayer`     → always shows (persistent).
 */
export function useCharacterDrawer(
  context: CharacterDrawerContext,
): UseCharacterDrawerResult {
  // Freeze the random picks so they don't change on re-renders
  const picksRef = useRef(getRandomCharacterDrawerPick(context));

  const [visible, setVisible] = useState<boolean>(true);

  const dismiss = useCallback(() => setVisible(false), []);
  const show = useCallback(() => setVisible(true), []);

  return {
    message: picksRef.current.message,
    avatarSource: picksRef.current.avatarSource,
    shouldShow: visible,
    dismiss,
    show,
  };
}
