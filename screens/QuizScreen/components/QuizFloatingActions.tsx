import React, { memo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface FloatingActionItem {
  key: string;
  label: string;
  icon: IoniconName;
  onPress: () => void;
  visible?: boolean;
  disabled?: boolean;
}

interface QuizFloatingActionsProps {
  actions: FloatingActionItem[];
}

export const QuizFloatingActions = memo(
  ({ actions }: QuizFloatingActionsProps) => {
    const insets = useSafeAreaInsets();
    const [isOpen, setIsOpen] = useState(false);

    const visibleActions = actions.filter((item) => item.visible !== false);

    if (visibleActions.length === 0) return null;

    const handleMainPress = () => {
      setIsOpen((prev) => !prev);
    };

    const handleActionPress = (action: FloatingActionItem) => {
      if (action.disabled) return;

      action.onPress();
      setIsOpen(false);
    };

    return (
      <View
        pointerEvents="box-none"
        style={[
          styles.container,
          {
            top: insets.top + 10,
          },
        ]}
      >
        {isOpen && (
          <View pointerEvents="box-none" style={styles.actionsWrapper}>
            {visibleActions.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => handleActionPress(action)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.actionButton,
                  action.disabled && styles.disabled,
                  pressed && !action.disabled && styles.pressed,
                ]}
              >
                <BlurView
                  intensity={20}
                  tint="dark"
                  style={StyleSheet.absoluteFillObject}
                />

                <LinearGradient
                  colors={["rgba(99,102,241,0.28)", "rgba(255,255,255,0.07)"]}
                  style={StyleSheet.absoluteFillObject}
                />

                <Ionicons name={action.icon} size={rf(1.9)} color="#FFFFFF" />

                <Text
                  numberOfLines={1}
                  style={{ fontSize: rf(1.15) }}
                  className="ml-2 font-main-bold text-white/90"
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          onPress={handleMainPress}
          hitSlop={10}
          style={({ pressed }) => [
            styles.mainButton,
            pressed && styles.pressed,
          ]}
        >
          <BlurView
            intensity={24}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />

          <LinearGradient
            colors={["rgba(168,85,247,0.38)", "rgba(56,189,248,0.18)"]}
            style={StyleSheet.absoluteFillObject}
          />

          <Ionicons
            name={isOpen ? "close-outline" : "ellipsis-horizontal-outline"}
            size={rf(2.6)}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    );
  },
);

QuizFloatingActions.displayName = "QuizFloatingActions";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 14,
    zIndex: 100,
    elevation: 100,
    alignItems: "flex-end",
  },
  actionsWrapper: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  mainButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  actionButton: {
    minWidth: 122,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    marginBottom: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  pressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
});
