import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch } from "react-redux";
import { playSound } from "@/redux/reducers/soundReducer";
import { Table, FastForward, Split, Zap } from "lucide-react-native";

interface ButtonProps {
  showHint: boolean;
  setIsTableOpen: (isOpen: boolean) => void;
  handleNextQuestion: () => void;
  handleFiftyFifty: () => void;
}

const ActionButton = memo(
  ({
    label,
    onPress,
    variant = "primary",
    icon: Icon,
  }: {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "accent";
    icon?: any;
  }) => {
    const dispatch = useDispatch();

    const handlePress = () => {
      dispatch(playSound("select"));
      onPress();
    };

    // Define color themes
    const themes = {
      primary: {
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/40",
        text: "text-indigo-400",
        icon: "#818cf8",
      },
      secondary: {
        bg: "bg-white/5",
        border: "border-white/10",
        text: "text-slate-400",
        icon: "#94a3b8",
      },
      accent: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/40",
        text: "text-amber-400",
        icon: "#fbbf24",
      },
    };

    const current = themes[variant];

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.95 : 1 }],
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        className={`flex-1 flex-row items-center justify-center h-14 rounded-2xl border ${current.bg} ${current.border}`}
      >
        {Icon && <Icon size={18} color={current.icon} strokeWidth={2.5} />}
        <Text className={`ml-2 text-[11px] font-black uppercase tracking-[2px] ${current.text}`}>
          {label}
        </Text>
      </Pressable>
    );
  }
);

export const QuizButton: React.FC<ButtonProps> = memo(
  ({
    showHint,
    setIsTableOpen,
    handleNextQuestion,
    handleFiftyFifty,
  }) => {
    return (
      <View className="mt-4 px-4 py-6 rounded-[32px] bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl">
        {/* Label for the action section */}
        <View className="flex-row items-center mb-4 px-2">
          <Zap size={12} color="#6366f1" fill="#6366f1" />
          <Text className="ml-2 text-[10px] font-bold text-indigo-500/60 uppercase tracking-[3px]">
            Available Lifelines
          </Text>
        </View>

        <View className="flex-row gap-3">
          {/* Lifeline: 50-50 */}
          {!showHint && (
            <ActionButton
              label="50:50"
              onPress={handleFiftyFifty}
              variant="secondary"
              icon={Split}
            />
          )}

          {/* Reference: Quiz Table */}
          <ActionButton
            label="Table"
            onPress={() => setIsTableOpen(true)}
            variant="secondary"
            icon={Table}
          />

          {/* Primary Action: Next (Changes to Accent color when available) */}
          {showHint && (
            <ActionButton
              label="Proceed"
              onPress={handleNextQuestion}
              variant="accent"
              icon={FastForward}
            />
          )}
        </View>
      </View>
    );
  }
);