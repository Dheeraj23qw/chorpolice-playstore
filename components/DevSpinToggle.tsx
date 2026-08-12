import React from "react";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Text";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
import { resetSpinLock, recordSpin } from "@/features/locks/lockSlice";
import { SPIN_COOLDOWN_MS } from "@/constants/spinwheel";

export function DevSpinToggle() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const spinLock = useAppSelector((s) => s.lock.spin);

  const COOLDOWN_MS = SPIN_COOLDOWN_MS;
  const isLocked =
    spinLock.lastUsedTimestamp !== null &&
    Date.now() - spinLock.lastUsedTimestamp < COOLDOWN_MS;

  const toggle = React.useCallback(() => {
    if (isLocked) {
      dispatch(resetSpinLock());
    } else {
      dispatch(recordSpin());
    }
  }, [dispatch, isLocked]);

  if (!__DEV__) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggle}
      className="absolute right-4 top-2 z-[9999] rounded-full border border-amber-400/40 bg-black/80 px-3 py-1.5 shadow-lg active:opacity-80"
    >
      <Text className="font-main-bold text-[9px] uppercase tracking-widest text-amber-300">
        DEV Spin: {isLocked ? "Cooldown (Tap to Unlock)" : "Live (Tap to Lock)"}
      </Text>
    </TouchableOpacity>
  );
}
