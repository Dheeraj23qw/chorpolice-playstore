import React from "react";
import {
  Modal,
  Pressable,
  View,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MultiplayerHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const MultiplayerHelpModal: React.FC<MultiplayerHelpModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Backdrop */}
        <Pressable onPress={onClose} className="absolute inset-0 bg-black/60" />

        <View
          className="flex-1 items-center justify-center p-4"
          pointerEvents="box-none"
        >
          <AnimatePresence>
            {visible && (
              <MotiView
                from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, translateY: 10 }}
                transition={{ type: "timing", duration: 300 }}
                className="w-full max-w-md overflow-hidden rounded-[40px]"
                style={{
                  // Ensure modal doesn't exceed screen height minus safe areas
                  maxHeight: SCREEN_HEIGHT - (insets.top + insets.bottom + 40),
                }}
              >
                <BlurView
                  intensity={80}
                  tint="dark"
                  className="overflow-hidden"
                >
                  <View className="absolute inset-0 rounded-[40px] border border-white/10" />

                  <View className="p-6 md:p-8">
                    {/* HEADER */}
                    <View className="mb-6 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
                          <Ionicons
                            name="help-buoy"
                            size={20}
                            color="#818cf8"
                          />
                        </View>
                        <Text className="font-main-bold text-lg text-white md:text-xl">
                          Multiplayer Guide
                        </Text>
                      </View>

                      <Pressable
                        onPress={onClose}
                        hitSlop={12}
                        className="h-8 w-8 items-center justify-center rounded-full bg-white/5"
                      >
                        <Ionicons name="close" size={20} color="white" />
                      </Pressable>
                    </View>

                    {/* SCROLLABLE CONTENT */}
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      // flexGrow: 0 allows the scrollview to shrink if content is small
                      contentContainerStyle={{ flexGrow: 0 }}
                      className="shrink"
                    >
                      <HelpSection
                        title="Network Setup"
                        icon="wifi"
                        color="#3b82f6"
                        content="Ensure all players are connected to the same Wi-Fi network. For the best experience, use a mobile hotspot if public Wi-Fi is unstable."
                      />

                      <HelpSection
                        title="Hosting a Game"
                        icon="desktop"
                        color="#8b5cf6"
                        content="As a host, share your QR Code or Room Code. Once  players are connected, you can set the entry coins and start the match."
                      />

                      <HelpSection
                        title="Player Identity"
                        icon="person-circle"
                        color="#10b981"
                        content="Every player must choose a unique name and avatar. The game will block starting if there are duplicate identities in the lobby."
                      />

                      <HelpSection
                        title="Joining a Game"
                        icon="qr-code"
                        color="#f59e0b"
                        content="Scan the Host's QR code or enter the Room Code manually. You'll enter the lobby setup to customize your profile while waiting."
                      />
                    </ScrollView>

                    {/* CLOSE BUTTON */}
                    <Pressable
                      onPress={onClose}
                      className="mt-6 overflow-hidden rounded-2xl"
                    >
                      <LinearGradient
                        colors={["#6366f1", "#4f46e5"]}
                        className="items-center py-4"
                      >
                        <Text className="font-main-bold uppercase tracking-[2px] text-white">
                          Got it!
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </BlurView>
              </MotiView>
            )}
          </AnimatePresence>
        </View>
      </View>
    </Modal>
  );
};

const HelpSection = ({ title, icon, color, content }: any) => (
  <View className="mb-5">
    <View className="mb-1.5 flex-row items-center gap-2">
      <Ionicons name={icon} size={16} color={color} />
      <Text
        className="font-main-bold text-[10px] uppercase tracking-[2px] md:text-xs"
        style={{ color }}
      >
        {title}
      </Text>
    </View>
    <Text className="text-sm leading-5 text-white/60">{content}</Text>
  </View>
);
