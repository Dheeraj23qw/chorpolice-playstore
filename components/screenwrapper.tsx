import React, { ReactNode } from "react";
import { View, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "./Text";

type ScreenWrapperProps = {
  title: string;
  children: ReactNode;
  showBackButton?: boolean;
  subtitle?: string;
  rightAction?: ReactNode;
  onBackPress?: () => void;
  variant?: "dark" | "light"; 
};

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  title,
  children,
  showBackButton = true,
  subtitle,
  rightAction,
  onBackPress,
  variant = "dark",
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isDark = variant === "dark";

  const handleBack = () => {
    if (onBackPress) {
      return onBackPress();
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      
      {/* ================= Fancy Header ================= */}
      <View 
        style={{ paddingTop: insets.top + 10 }}
        className={`px-6 pb-6 rounded-b-[40px] shadow-2xl ${
          isDark 
            ? "bg-slate-900 border-b border-slate-800 shadow-indigo-500/10" 
            : "bg-white border-b border-slate-100 shadow-slate-200"
        }`}
      >
        {/* Background Decorative "Glow" for Dark Mode */}
        {isDark && (
          <View className="absolute -top-10 left-1/2 -translate-x-1/2 h-32 w-64 bg-indigo-500/10 blur-3xl rounded-full" />
        )}

        <View className="flex-row items-center justify-between">
          {/* Back Button */}
          {showBackButton ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBack}
              className={`h-12 w-12 items-center justify-center rounded-2xl border ${
                isDark 
                  ? "bg-slate-800 border-slate-700 shadow-black/50" 
                  : "bg-slate-50 border-slate-200 shadow-sm"
              }`}
            >
              <ChevronLeft size={24} color={isDark ? "#F8FAFC" : "#1E293B"} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <View className="h-12 w-12" />
          )}

          {/* Title Area */}
          <View className="flex-1 items-center px-4">
            <Text
              numberOfLines={1}
              className={`text-xl font-main-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {title}
            </Text>

            {subtitle && (
              <View className={`mt-1 px-3 py-0.5 rounded-full ${isDark ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                <Text className="text-[10px] font-main-bold uppercase tracking-[1.5px] text-indigo-500">
                  {subtitle}
                </Text>
              </View>
            )}
          </View>

          {/* Right Action */}
          <View className="h-12 w-12 items-center justify-center">
            {rightAction || <View className="h-2 w-2 rounded-full bg-indigo-500/20" />}
          </View>
        </View>
      </View>

      {/* ================= Content ================= */}
      <View className="flex-1">
        {children}
      </View>
    </View>
  );
};

ScreenWrapper.displayName = "ScreenWrapper";

export default ScreenWrapper;