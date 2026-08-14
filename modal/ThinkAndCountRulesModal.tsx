import React, { useState } from "react";
import { Modal, Pressable, View, ScrollView, Dimensions, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rf } from "@/utils/responsive";

export type ThinkAndCountRulesLanguage = "EN" | "HI";

export interface ThinkAndCountRulesItem {
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export interface ThinkAndCountRulesContent {
  headerTitle: string;
  headerSubtitle: string;
  buttonText: string;
  toggleText: string;
  items: ThinkAndCountRulesItem[];
}

export const THINK_AND_COUNT_RULES_CONTENT: Record<
  ThinkAndCountRulesLanguage,
  ThinkAndCountRulesContent
> = {
  EN: {
    headerTitle: "Think & Count Rules",
    headerSubtitle: "How to play the quiz",
    buttonText: "Let's Play",
    toggleText: "Hinglish",
    items: [
      {
        title: "Brain Quiz",
        desc: "Answer 5 tricky mental-math and data questions based on the game's table.",
        icon: "bulb-outline",
        color: "#a78bfa",
      },
      {
        title: "Check The Table",
        desc: "Tap the Table icon anytime to view round-by-round scores for Police, King, Thief, and Advisor.",
        icon: "grid-outline",
        color: "#facc15",
      },
      {
        title: "Speed Matters",
        desc: "Answer fast! If there's a tie, the player who answered quickest wins.",
        icon: "timer-outline",
        color: "#fb7185",
      },
      {
        title: "50-50 Lifeline",
        desc: "Stuck? Use the 50-50 button to remove two wrong options (Max 2 uses per game).",
        icon: "help-buoy-outline",
        color: "#22c55e",
      },
      {
        title: "Win The Pot",
        desc: "The player with the most correct answers wins the entire pot!",
        icon: "trophy-outline",
        color: "#818cf8",
      },
    ],
  },
  HI: {
    headerTitle: "Think & Count Rules",
    headerSubtitle: "Quiz kaise khelte hain",
    buttonText: "Chalo Khelein",
    toggleText: "English",
    items: [
      {
        title: "Dimag Ka Khel",
        desc: "Game table data par based 5 tricky questions ke answer dein.",
        icon: "bulb-outline",
        color: "#a78bfa",
      },
      {
        title: "Table Check Karo",
        desc: "Kisi bhi waqt Table icon dabakar Police, King, Chor aur Mantri ke scores dekhein.",
        icon: "grid-outline",
        color: "#facc15",
      },
      {
        title: "Speed Zaroori Hai",
        desc: "Jaldi answer dein! Agar tie hua, toh sabse fast answer dene wala jeetega.",
        icon: "timer-outline",
        color: "#fb7185",
      },
      {
        title: "50-50 Lifeline",
        desc: "Agar phans gaye, toh 50-50 button use karein 2 galat options hatane ke liye (Max 2 baar).",
        icon: "help-buoy-outline",
        color: "#22c55e",
      },
      {
        title: "Jeeto Sara Pot",
        desc: "Jiske sabse zyada correct answers honge, woh pura pot jeetega!",
        icon: "trophy-outline",
        color: "#818cf8",
      },
    ],
  },
};

interface ThinkAndCountRulesModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const ThinkAndCountRulesModal: React.FC<ThinkAndCountRulesModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = useState<ThinkAndCountRulesLanguage>("HI");

  const content = THINK_AND_COUNT_RULES_CONTENT[language];

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "EN" ? "HI" : "EN"));
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#04050B]">
        <LinearGradient
          colors={["#05060D", "#0B1020", "#05060D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute inset-0 bg-black/65" />
        <Pressable onPress={onClose} className="absolute inset-0" />

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
                    <View className="mb-6 flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center pr-3">
                        <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl border border-indigo-300/20 bg-indigo-500/15">
                          <Ionicons
                            name="school-outline"
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

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      className="shrink"
                      contentContainerStyle={{ paddingBottom: 4, gap: 12 }}
                    >
                      {content.items.map((item, index) => (
                        <RuleItem key={item.title} {...item} index={index} />
                      ))}
                    </ScrollView>

                    <Pressable
                      onPress={onClose}
                      className="mt-6 overflow-hidden rounded-[22px]"
                    >
                      <LinearGradient
                        colors={["#818cf8", "#6366f1", "#4f46e5"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <View className="h-14 flex-row items-center justify-center">
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

const RuleItem = ({
  title,
  desc,
  icon,
  color,
  index,
}: ThinkAndCountRulesItem & { index: number }) => {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -14 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: "timing",
        duration: 260,
        delay: index * 60,
      }}
      className="rounded-3xl border border-white/10 bg-white/5"
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
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          style={{ fontSize: rf(1.18), lineHeight: rf(1.75) }}
          className="mt-1 font-main-md text-white/45"
          numberOfLines={2}
        >
          {desc}
        </Text>
      </View>
      </View>
    </MotiView>
  );
};
