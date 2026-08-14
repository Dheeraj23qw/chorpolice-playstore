import { useCallback, useEffect, useRef, useState } from "react";
import * as Updates from "expo-updates";
import { useAppSelector } from "@/hooks/useAppRedux";
import { checkAppUpdate } from "@/utils/versionCheck";
import { GamePhase } from "@/redux/reducers/sessionSlice";

type UpdateCheckState =
  | { status: "idle" }
  | { status: "checking" }
  | {
      status: "native-update";
      version: string;
      mandatory: boolean;
      url: string;
    }
  | { status: "ota-downloading" }
  | { status: "ota-ready" }
  | { status: "error"; message: string };

const GAME_PHASES_REQUIRING_DEFERRED_RESTART: GamePhase[] = [
  "waiting",
  "dealing",
  "police_turn",
  "result",
  "round_video",
  "score_quiz",
  "private_reveal",
  "investigation_shuffle",
  "video_transition",
];

let globalUpdateLock = false;

export const useOTAUpdate = () => {
  const [updateState, setUpdateState] = useState<UpdateCheckState>({ status: "idle" });
  const [isUpdating, setIsUpdating] = useState(false);

  const gamePhase = useAppSelector((state) => state.session.gamePhase);
  const isGameActive = GAME_PHASES_REQUIRING_DEFERRED_RESTART.includes(gamePhase);

  const checkIdRef = useRef(0);
  const hasRunRef = useRef(false);
  const isGameActiveRef = useRef(isGameActive);
  const updateStateRef = useRef(updateState);

  useEffect(() => {
    isGameActiveRef.current = isGameActive;
    updateStateRef.current = updateState;
  }, [isGameActive, updateState]);

  const checkAndApplyUpdate = useCallback(async () => {
    if (globalUpdateLock) return;
    if (hasRunRef.current) return;
    if (__DEV__ || !Updates.isEnabled) {
      return;
    }

    hasRunRef.current = true;
    globalUpdateLock = true;
    const thisCheckId = ++checkIdRef.current;

    try {
      setUpdateState({ status: "checking" });

      const nativeResult = await checkAppUpdate();
      if (nativeResult.isAvailable) {
        if (thisCheckId !== checkIdRef.current) return;
        setUpdateState({
          status: "native-update",
          version: nativeResult.latestVersion,
          mandatory: nativeResult.isMandatory,
          url: nativeResult.updateUrl,
        });
        return;
      }

      const checkTask = Updates.checkForUpdateAsync();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Update check timed out")), 10000),
      );

      const update = await Promise.race([checkTask, timeoutPromise]) as Updates.UpdateCheckResult;

      if (!update.isAvailable) {
        if (thisCheckId !== checkIdRef.current) return;
        setUpdateState({ status: "idle" });
        return;
      }

      setUpdateState({ status: "ota-downloading" });

      const fetchTask = Updates.fetchUpdateAsync();
      const fetchTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("OTA download timed out")), 60000),
      );

      const result = await Promise.race([fetchTask, fetchTimeout]) as Updates.UpdateFetchResult;

      if (result.isNew) {
        if (thisCheckId !== checkIdRef.current) return;
        setUpdateState({ status: "ota-ready" });
      } else {
        if (thisCheckId !== checkIdRef.current) return;
        setUpdateState({ status: "idle" });
      }
    } catch (error: any) {
      if (thisCheckId !== checkIdRef.current) return;
      setUpdateState({ status: "error", message: error?.message || "Update check failed" });
    } finally {
      globalUpdateLock = false;
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    const current = updateStateRef.current;

    if (current.status === "native-update") {
      try {
        setIsUpdating(true);
        const { Linking } = await import("react-native");
        await Linking.openURL(current.url);
      } catch (error: any) {
        console.error("[UPDATE] Open URL failed:", error);
        setIsUpdating(false);
        throw error;
      }
      return;
    }

    if (current.status === "ota-ready") {
      if (isGameActiveRef.current) {
        throw new Error("Cannot restart during active game");
      }

      try {
        setIsUpdating(true);
        await Updates.reloadAsync();
      } catch (error: any) {
        console.error("[OTA] Reload failed:", error);
        setIsUpdating(false);
        throw error;
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await Promise.resolve();
      if (!cancelled) {
        checkAndApplyUpdate();
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [checkAndApplyUpdate]);

  const isNativeUpdate = updateState.status === "native-update";
  const otaAvailable = updateState.status === "ota-ready";

  return {
    updateState,
    isUpdating,
    isNativeUpdate,
    otaAvailable,
    latestVersion: updateState.status === "native-update" ? updateState.version : "",
    updateUrl: updateState.status === "native-update" ? updateState.url : "",
    isMandatory: updateState.status === "native-update" ? updateState.mandatory : false,
    checkAndApplyUpdate,
    applyUpdate,
    isGameActive,
  };
};
