import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { useDispatch } from "react-redux";

import { rf } from "@/utils/responsive";
import { Text } from "@/components/Text";
import WifiHint from "@/components/WifiHint";
import { openModalUI, closeModalUI } from "@/redux/reducers/uiStateSlice";

interface GameModeModalProps {
  isVisible: boolean;
  onClose: () => void;
  gameType: string;
}

const GameModeModal: React.FC<GameModeModalProps> = ({
  isVisible,
  onClose,
  gameType,
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const glowSize = Math.min(width * 1.2, 500);

  useEffect(() => {
    if (isVisible) {
      dispatch(openModalUI());
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      navigation.setOptions({
        tabBarStyle: { display: "none" },
      });
    } else {
      dispatch(closeModalUI());
    }
  }, [isVisible, gameType, navigation, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(closeModalUI());
    };
  }, [dispatch]);

  const handleSelection = async (mode: "host" | "join") => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    proceedWithSelection(mode);
  };

  const proceedWithSelection = (mode: "host" | "join") => {
    router.push({
      pathname: mode === "host" ? "/host" : "/join",
      params: { gameType },
    } as any);

    requestAnimationFrame(onClose);
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <Pressable className="flex-1 bg-black/60" onPress={onClose}>
        <BlurView
          intensity={25}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={[
            "rgba(10, 0, 20, 0.4)",
            "transparent",
            "rgba(76, 29, 149, 0.2)",
            "rgba(0,0,0,0.9)",
          ]}
          locations={[0, 0.2, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />

        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 600 }}
          style={{
            position: "absolute",
            alignSelf: "center",
            width: glowSize,
            height: glowSize,
          }}
          className="rounded-full"
        >
          <View className="absolute self-center">
          <LinearGradient
            colors={[
              "rgba(99, 102, 241, 0.15)",
              "rgba(59, 130, 246, 0.08)",
              "transparent",
            ]}
            style={styles.glowFill}
          />
          </View>
        </MotiView>

        <View className="flex-1 justify-center px-6">
          <WifiHint />

          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04]"
          >
            <MotiView
              from={{ translateY: 40, opacity: 0, scale: 0.95 }}
              animate={{ translateY: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 400 }}
            >
              <BlurView intensity={80} tint="dark">
                <View className="p-6">
                <View className="mb-6 items-center">
                  <View className="h-16 w-16 items-center justify-center rounded-full bg-white/5">
                    <Ionicons
                      name="game-controller-outline"
                      size={rf(3.5)}
                      color="#E5E7EB"
                    />
                  </View>

                  <Text className="mt-3 font-main-bold text-xl text-white">
                    CHOOSE MODE
                  </Text>
                  <Text className="mt-1 text-xs text-white/40">
                    Play with friends or join others
                  </Text>
                </View>

                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 100 }}
                >
                  <TouchableOpacity
                    onPress={() => handleSelection("host")}
                    activeOpacity={0.85}
                    className="mb-3 overflow-hidden rounded-2xl"
                  >
                    <LinearGradient
                      colors={["#7C3AED33", "#7C3AED10"]}
                      className="border border-purple-400/20"
                    >
                      <View className="flex-row items-center p-4">
                        <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                          <Ionicons
                            name="wifi-outline"
                            size={rf(2.5)}
                            color="#C084FC"
                          />
                        </View>

                        <View className="flex-1">
                          <Text className="font-main-bold text-base text-white">
                            HOST GAME
                          </Text>
                          <Text className="text-xs text-white/40">
                            Create your own lobby
                          </Text>
                        </View>

                        <Ionicons
                          name="arrow-forward"
                          size={rf(1.8)}
                          color="#C084FC"
                        />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </MotiView>

                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 200 }}
                >
                  <TouchableOpacity
                    onPress={() => handleSelection("join")}
                    activeOpacity={0.85}
                    className="overflow-hidden rounded-2xl"
                  >
                    <LinearGradient
                      colors={["#2563EB33", "#2563EB10"]}
                      className="border border-blue-400/20"
                    >
                      <View className="flex-row items-center p-4">
                        <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                          <Ionicons
                            name="search-outline"
                            size={rf(2.5)}
                            color="#60A5FA"
                          />
                        </View>

                        <View className="flex-1">
                          <Text className="font-main-bold text-base text-white">
                            JOIN GAME
                          </Text>
                          <Text className="text-xs text-white/40">
                            Find nearby players
                          </Text>
                        </View>

                        <Ionicons
                          name="arrow-forward"
                          size={rf(1.8)}
                          color="#60A5FA"
                        />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </MotiView>
                </View>
              </BlurView>
            </MotiView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  glowFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
  },
});

export default React.memo(GameModeModal);
