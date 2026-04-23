import React, { useEffect } from "react";
import { Modal, View, TouchableOpacity, Image } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Text } from "@/components/Text";
import { useDispatch } from "react-redux";
import { openModalUI, closeModalUI } from "@/redux/reducers/uiStateSlice";

interface WelcomeProps {
  isVisible: boolean;
  onClaim: () => void;
}

export const WelcomeBonusModal: React.FC<WelcomeProps> = ({
  isVisible,
  onClaim,
}) => {
  const dispatch = useDispatch();

  /* 🔥 SYNC WITH GLOBAL UI STATE */
  useEffect(() => {
    if (isVisible) dispatch(openModalUI());
    else dispatch(closeModalUI());

    return () => {
      dispatch(closeModalUI());
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Modal transparent animationType="fade">
      <View className="flex-1 items-center justify-center px-6">
        {/* CARD */}
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 120,
          }}
          className="w-full max-w-sm overflow-hidden rounded-[50px] border border-white/40"
          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          <BlurView intensity={95} tint="dark" className="items-center p-10">
            {/* FLOATING THIEF */}
            <MotiView
              from={{ translateY: 0 }}
              animate={{ translateY: -15 }}
              transition={{
                loop: true,
                type: "timing",
                duration: 1500,
                repeatReverse: true,
              }}
              className="mb-4"
            >
              <Image
                source={require("@/assets/images/chorsipahi/thief.png")}
                className="h-32 w-32"
                resizeMode="contain"
              />
            </MotiView>

            {/* TITLE */}
            <Text className="font-main-bold text-4xl tracking-tighter text-white">
              BIG WIN!
            </Text>

            {/* COIN BOX */}
            <View className="my-8 w-full items-center rounded-[30px] border border-white/10 bg-white/5 py-6">
              <Text className="font-main-bold text-6xl text-yellow-400">
                10000
              </Text>
              <Text className="mt-1 font-main-bold text-sm tracking-[6px] text-white/70">
                COINS
              </Text>
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              onPress={onClaim}
              activeOpacity={0.9}
              className="w-full"
            >
              <View className="overflow-hidden rounded-2xl border-t border-white/30">
                <BlurView intensity={40} tint="light">
                  <LinearGradient
                    colors={[
                      "rgba(99, 102, 241, 0.7)",
                      "rgba(67, 56, 202, 0.7)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="items-center py-5"
                  >
                    <Text className="font-main-bold text-xl tracking-[2px] text-white">
                      ADD TO BAG
                    </Text>
                  </LinearGradient>
                </BlurView>
              </View>
            </TouchableOpacity>

            {/* FOOTER */}
            <Text className="mt-6 font-main-md text-[9px] uppercase tracking-[4px] text-white/20">
              TAP TO CONTINUE
            </Text>
          </BlurView>
        </MotiView>
      </View>
    </Modal>
  );
};
