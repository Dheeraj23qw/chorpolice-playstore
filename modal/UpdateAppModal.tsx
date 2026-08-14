import React, { useCallback, useState } from "react";
import { Linking, Modal, Pressable, View } from "react-native";
import { Rocket, Sparkles, X, Check, Zap } from "lucide-react-native";

import { Text } from "@/components/Text";

interface UpdateAppModalProps {
  isVisible: boolean;
  onClose: () => void;
  updateUrl: string;
  latestVersion: string;
  isMandatory?: boolean;
  isOta?: boolean;
  onApplyOta?: () => Promise<void> | void;
}

export const UpdateAppModal: React.FC<UpdateAppModalProps> = ({
  isVisible,
  onClose,
  updateUrl,
  latestVersion,
  isMandatory = false,
  isOta = false,
  onApplyOta,
}) => {
  const [isApplying, setIsApplying] = useState(false);

  const handleUpdate = useCallback(async () => {
    if (isApplying) return;

    setIsApplying(true);

    // OTA update
    if (isOta && onApplyOta) {
      try {
        await onApplyOta();
      } catch {
        setIsApplying(false);
      }

      return;
    }

    // Native update
    if (!updateUrl) {
      setIsApplying(false);
      return;
    }

    try {
      await Linking.openURL(updateUrl);
    } catch {
      setIsApplying(false);
    }
  }, [isApplying, isOta, onApplyOta, updateUrl]);

  const handleClose = useCallback(() => {
    if (isMandatory || isApplying) return;

    onClose();
  }, [isMandatory, isApplying, onClose]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/80 px-5">
        {/* ================= BACKDROP ================= */}

        {!isMandatory && (
          <Pressable onPress={handleClose} className="absolute inset-0" />
        )}

        {/* ================= MODAL CARD ================= */}

        <View className="w-full max-w-[430px] rounded-[32px] border border-white/10 bg-[#111118] p-6">
          {/* ================= CLOSE ================= */}

          {!isMandatory && (
            <Pressable
              onPress={handleClose}
              disabled={isApplying}
              hitSlop={10}
              className="absolute right-4 top-4 z-10 h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]"
            >
              <X size={18} color="rgba(255,255,255,0.55)" />
            </Pressable>
          )}

          {/* ================= ICON ================= */}

          <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
            <Rocket size={29} color="#A78BFA" strokeWidth={2.2} />
          </View>

          {/* ================= EYEBROW ================= */}

          <Text className="font-main-bold text-[10px] uppercase tracking-[3px] text-violet-400/70">
            NEW UPDATE
          </Text>

          {/* ================= TITLE ================= */}

          <Text className="mt-2 font-main-bold text-[27px] leading-[34px] text-white">
            New Version Available
          </Text>

          {/* ================= DESCRIPTION ================= */}

          <Text className="font-main-medium mt-3 text-[14px] leading-[21px] text-white/50">
            {isOta
              ? "A new game update is ready. Restart the game to apply it."
              : "A newer version of Chor Police is available. Update to get the latest improvements."}
          </Text>

          {/* ================= VERSION ================= */}

          <View className="mt-5 flex-row items-center justify-between rounded-2xl border border-amber-400/15 bg-amber-500/[0.06] px-4 py-3.5">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Sparkles size={18} color="#FBBF24" />
              </View>

              <View className="ml-3">
                <Text className="font-main-bold text-[10px] uppercase tracking-[1.5px] text-white/40">
                  LATEST VERSION
                </Text>

                <Text className="font-main-medium mt-1 text-[11px] text-white/30">
                  Ready to install
                </Text>
              </View>
            </View>

            <Text className="font-main-bold text-[20px] text-amber-400">
              v{latestVersion}
            </Text>
          </View>

          {/* ================= FEATURES ================= */}

          <View className="mt-5">
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <Check size={15} color="#A78BFA" strokeWidth={2.5} />
              </View>

              <Text className="font-main-medium ml-3 flex-1 text-[12px] text-white/45">
                Improved stability & performance
              </Text>
            </View>

            <View className="mt-2 flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <Zap size={15} color="#A78BFA" strokeWidth={2.5} />
              </View>

              <Text className="font-main-medium ml-3 flex-1 text-[12px] text-white/45">
                Better multiplayer experience
              </Text>
            </View>
          </View>

          {/* ================= UPDATE BUTTON ================= */}

          <Pressable
            onPress={handleUpdate}
            disabled={isApplying}
            className={`mt-6 h-14 w-full flex-row items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-600 ${
              isApplying ? "opacity-50" : "active:opacity-80"
            }`}
          >
            <Rocket size={18} color="#FFFFFF" strokeWidth={2.4} />

            <Text className="ml-2 font-main-bold text-[13px] uppercase tracking-[2px] text-white">
              {isApplying
                ? isOta
                  ? "Restarting..."
                  : "Opening..."
                : isOta
                  ? "Restart Now"
                  : "Update Now"}
            </Text>
          </Pressable>

          {/* ================= MAYBE LATER ================= */}

          {!isMandatory && (
            <Pressable
              onPress={handleClose}
              disabled={isApplying}
              className="mt-3 h-11 items-center justify-center"
            >
              <Text className="font-main-bold text-[11px] uppercase tracking-[2px] text-white/30">
                Maybe Later
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};
