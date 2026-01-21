import React, { ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";


type ScreenWrapperProps = {
  title: string;
  children: ReactNode;
  showBackButton?: boolean;
  subtitle?: string;
  rightAction?: ReactNode;
  onBackPress?: () => void;   // optional override
};


const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  title,
  children,
  showBackButton = true,
  subtitle,
  rightAction,
  onBackPress,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/"); // fallback home route
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* ================= Header ================= */}
      <View
        className="bg-white px-5 pb-4 pt-3"
        style={{
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
            },
            android: {
              elevation: 6,
            },
          }),
        }}
      >
        <View className="flex-row items-center justify-between">
          {/* Back Button */}
          {showBackButton ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBack}
              className="h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white"
            >
              <ChevronLeft size={22} color="#ffffff" strokeWidth={3.5} />
            </TouchableOpacity>
          ) : (
            <View className="h-10 w-10" />
          )}

          {/* Title */}
          <View className="flex-1 items-center px-3">
            <Text
              numberOfLines={1}
              className="text-[18px] font-extrabold tracking-tight text-slate-900"
            >
              {title}
            </Text>

            {subtitle && (
              <Text className="mt-[2px] text-[11px] font-semibold uppercase tracking-widest text-indigo-500">
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Action Slot */}
          <View className="h-10 w-10 items-center justify-center">
            {rightAction}
          </View>
        </View>
      </View>

      {/* ================= Content ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 80,
        }}
        className="flex-1 px-5"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};


export default ScreenWrapper;
