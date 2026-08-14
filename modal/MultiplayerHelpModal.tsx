import React, { useState } from "react";
import {
  Modal,
  Pressable,
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Text } from "@/components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rf } from "@/utils/responsive";
import {
  MULTIPLAYER_HELP_CONTENT,
  HelpLanguage,
  MultiplayerHelpItem,
} from "@/constants/multiplayerHelpContent";

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
  const [language, setLanguage] = useState<HelpLanguage>("HI");

  const content = MULTIPLAYER_HELP_CONTENT[language];

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "EN" ? "HI" : "EN"));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1">
        <Pressable onPress={onClose} className="absolute inset-0 bg-black/70" />

        <View className="flex-1 items-center justify-center px-5">
          <AnimatePresence>
            {visible && (
              <MotiView
                from={{ opacity: 0, scale: 0.92, translateY: 22 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.94, translateY: 12 }}
                transition={{ type: "spring", damping: 17, stiffness: 140 }}
                className="w-full max-w-md overflow-hidden rounded-[36px]"
                style={{
                  maxHeight: SCREEN_HEIGHT - (insets.top + insets.bottom + 40),
                }}
              >
                <View className="w-full">
                  <BlurView
                    intensity={70}
                    tint="dark"
                    className="overflow-hidden"
                  >
                    <LinearGradient
                      colors={[
                        "rgba(99,102,241,0.24)",
                        "rgba(15,23,42,0.94)",
                        "rgba(2,6,23,0.98)",
                      ]}
                      style={StyleSheet.absoluteFill}
                    />

                    <View className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20" />
                    <View className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-blue-500/10" />
                    <View className="absolute inset-0 rounded-[36px] border border-white/10" />

                    <View className="p-6">
                      {/* Header */}
                      <View className="mb-6 flex-row items-center justify-between">
                        <View className="flex-1 flex-row items-center pr-3">
                          <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl border border-indigo-300/20 bg-indigo-500/15">
                            <Ionicons
                              name="game-controller"
                              size={25}
                              color="#C7D2FE"
                            />
                          </View>

                          <View className="flex-1">
                            <Text
                              style={{ fontSize: rf(2.05) }}
                              className="font-main-bold text-white"
                              numberOfLines={1}
                            >
                              {content.headerTitle}
                            </Text>

                            <Text
                              style={{ fontSize: rf(1.08) }}
                              className="mt-0.5 font-main-md text-white/45"
                              numberOfLines={2}
                            >
                              {content.headerSubtitle}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center">
                          <Pressable
                            onPress={toggleLanguage}
                            hitSlop={10}
                            className="mr-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5"
                          >
                            <Text className="font-main-bold text-[10px] text-white/80">
                              {content.toggleText}
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={onClose}
                            hitSlop={12}
                            className="h-9 w-9 items-center justify-center rounded-full bg-white/10"
                          >
                            <Ionicons name="close" size={20} color="white" />
                          </Pressable>
                        </View>
                      </View>

                      {/* Content */}
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        className="shrink"
                        contentContainerStyle={{ paddingBottom: 4 }}
                      >
                        {content.items.map((item, index) => (
                          <HelpItem key={item.title} {...item} index={index} />
                        ))}
                      </ScrollView>

                      {/* Report a Bug */}
                      <Pressable
                        onPress={() => {
                          onClose();
                          router.push("/report-bug");
                        }}
                        className="mt-4 flex-row items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3"
                      >
                        <Ionicons name="bug-outline" size={18} color="#FCA5A5" />
                        <Text className="ml-2 font-main-bold text-sm text-red-200">
                          Report a Bug
                        </Text>
                      </Pressable>

                      {/* Button */}
                      <Pressable
                        onPress={onClose}
                        className="mt-4 overflow-hidden rounded-[22px]"
                      >
                        <LinearGradient
                          colors={["#818cf8", "#6366f1", "#4f46e5"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <View className="h-14 flex-1 flex-row items-center justify-center">
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="white"
                            />

                            <Text className="ml-2 font-main-bold uppercase tracking-[2px] text-white">
                              {content.buttonText}
                            </Text>
                          </View>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </BlurView>
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>
      </View>
    </Modal>
  );
};

const HelpItem = ({
  title,
  desc,
  icon,
  color,
  index,
}: MultiplayerHelpItem & { index: number }) => {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -14 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: "timing",
        duration: 260,
        delay: index * 60,
      }}
      className="mb-3 rounded-3xl border border-white/10 bg-white/5"
    >
      <View className="mb-3 flex-row items-center p-4">
        <View
          className="h-13 w-13 mr-4 items-center justify-center rounded-2xl border border-white/10 bg-white/10"
          style={{
            shadowColor: color,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Ionicons name={icon} size={25} color={color} />
        </View>

        <View className="flex-1">
          <Text
            style={{ fontSize: rf(1.45) }}
            className="font-main-bold text-white"
          >
            {title}
          </Text>

          <Text
            style={{ fontSize: rf(1.18), lineHeight: rf(1.75) }}
            className="mt-1 font-main-md text-white/60"
          >
            {desc}
          </Text>
        </View>
      </View>
    </MotiView>
  );
};
