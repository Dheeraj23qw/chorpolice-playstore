import { useCallback, useEffect, useRef, useState, createContext, useContext } from "react";
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
  | { status: "ota-pending" }
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
let lastCheckTimestamp = 0;
const CHECK_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

interface UpdateContextValue {
  updateState: UpdateCheckState;
  isUpdating: boolean;
  isNativeUpdate: boolean;
  otaReady: boolean;
  latestVersion: string;
  updateUrl: string;
  isMandatory: boolean;
  isGameActive: boolean;
  skippedUpdate: boolean;
  setSkippedUpdate: (value: boolean) => void;
  checkForUpdate: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  applyUpdate: () => Promise<void>;
}

const UpdateContext = createContext<UpdateContextValue | null>(null);

export const UpdateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [updateState, setUpdateState] =
    useState<UpdateCheckState>({ status: "idle" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [skippedUpdate, setSkippedUpdate] = useState(false);

  const gamePhase = useAppSelector((state) => state.session.gamePhase);
  const isGameActive = GAME_PHASES_REQUIRING_DEFERRED_RESTART.includes(gamePhase);

  const checkIdRef = useRef(0);
  const isGameActiveRef = useRef(isGameActive);
  const updateStateRef = useRef(updateState);

  useEffect(() => {
    isGameActiveRef.current = isGameActive;
    updateStateRef.current = updateState;
  }, [isGameActive, updateState]);

  const checkForUpdate = useCallback(async () => {
    if (globalUpdateLock) return;
    if (__DEV__ || !Updates.isEnabled) {
      return;
    }

    // Allow immediate retry on error, otherwise enforce cooldown
    const now = Date.now();
    const isError = updateStateRef.current.status === "error";
    if (!isError && now - lastCheckTimestamp < CHECK_COOLDOWN_MS) return;

    globalUpdateLock = true;
    lastCheckTimestamp = now;
    const thisCheckId = ++checkIdRef.current;

    try {
      setUpdateState({ status: "checking" });

      const nativeResult = await checkAppUpdate();
      if (thisCheckId !== checkIdRef.current) return;

      if (nativeResult.isAvailable) {
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

      if (isGameActiveRef.current) {
        if (thisCheckId !== checkIdRef.current) return;
        setUpdateState({ status: "ota-pending" });
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

  const downloadUpdate = useCallback(async () => {
    const current = updateStateRef.current;
    if (current.status !== "ota-pending") return;

    setUpdateState({ status: "ota-downloading" });

    try {
      const fetchTask = Updates.fetchUpdateAsync();
      const fetchTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("OTA download timed out")), 60000),
      );

      const result = await Promise.race([fetchTask, fetchTimeout]) as Updates.UpdateFetchResult;

      if (result.isNew) {
        setUpdateState({ status: "ota-ready" });
      } else {
        setUpdateState({ status: "idle" });
      }
    } catch (error: any) {
      setUpdateState({ status: "error", message: error?.message || "OTA download failed" });
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
        await checkForUpdate();
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [checkForUpdate]);

  useEffect(() => {
    if (!isGameActive && updateState.status === "ota-pending") {
      const timer = setTimeout(() => {
        downloadUpdate();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isGameActive, updateState.status, downloadUpdate]);

  const isNativeUpdate = updateState.status === "native-update";
  const otaReady = updateState.status === "ota-ready";
  const latestVersion =
    updateState.status === "native-update" ? updateState.version : "";
  const updateUrl =
    updateState.status === "native-update" ? updateState.url : "";
  const isMandatory =
    updateState.status === "native-update" ? updateState.mandatory : false;

  return (
    <UpdateContext.Provider
      value={{
        updateState,
        isUpdating,
        isNativeUpdate,
        otaReady,
        latestVersion,
        updateUrl,
        isMandatory,
        isGameActive,
        skippedUpdate,
        setSkippedUpdate,
        checkForUpdate,
        downloadUpdate,
        applyUpdate,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdateState = () => {
  const ctx = useContext(UpdateContext);
  if (!ctx) {
    throw new Error("useUpdateState must be used within UpdateProvider");
  }
  return ctx;
};

export const useOTAUpdate = useUpdateState;
