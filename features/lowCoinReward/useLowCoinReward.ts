// useLowCoinRewardModal.ts
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  getLowCoinState,
  disableForever,
  dismissTemp,
} from "@/storage/lowCoinStorage";

const THRESHOLD = 1000;
const COOLDOWN = 1000 * 60 * 60 * 24; // 24h

export const useLowCoinRewardModal = () => {
  const coins = useSelector((s: RootState) => s.wallet.coins);

  const [visible, setVisible] = useState(false);

  const check = useCallback(() => {
    const state = getLowCoinState();

    if (state.disabledForever) return;

    if (coins >= THRESHOLD) return;

    const now = Date.now();

    if (state.lastDismissed && now - state.lastDismissed < COOLDOWN) {
      return; // still cooling down
    }

    setVisible(true);
  }, [coins]);

  useEffect(() => {
    check();
  }, [check]);

  const onShare = () => {
    // you can plug real share logic here
    setVisible(false);
  };

  const onRate = () => {
    // open store link
    setVisible(false);
  };

  const onClose = () => {
    dismissTemp();
    setVisible(false);
  };

  const onDisableForever = () => {
    disableForever();
    setVisible(false);
  };

  return {
    visible,
    onShare,
    onRate,
    onClose,
    onDisableForever,
  };
};
