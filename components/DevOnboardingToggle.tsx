import React from "react";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Text";
import { useAppDispatch } from "@/hooks/useAppRedux";
import { setAppPhase } from "@/redux/reducers/appFlowReducer";
import {
  getForceOnboardingEveryLaunch,
  setForceOnboardingEveryLaunch,
} from "@/storage/appStorage";

interface DevOnboardingToggleProps {
  /** Flipping ON immediately transitions to the onboarding screen. */
  immediate?: boolean;
}

/**
 * Dev-only toggle: persist "replay onboarding every launch".
 * When `immediate` is set, turning it ON jumps straight into onboarding,
 * so there's no need to reload the app.
 */
export function DevOnboardingToggle({
  immediate = false,
}: DevOnboardingToggleProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [force, setForce] = React.useState(getForceOnboardingEveryLaunch());

  const toggle = React.useCallback(() => {
    const next = !force;
    setForceOnboardingEveryLaunch(next);
    setForce(next);
    if (next && immediate) {
      dispatch(setAppPhase("ONBOARDING"));
    }
  }, [dispatch, force, immediate]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggle}
      className="absolute z-[9999] rounded-full border border-white/15 bg-black/60 px-4 py-2"
      style={{ left: 20, top: insets.top + 12 }}
    >
      <Text className="font-main-bold text-[10px] uppercase tracking-widest text-white/70">
        Onboarding: {force ? "Every launch" : "Once"}
      </Text>
    </TouchableOpacity>
  );
}
