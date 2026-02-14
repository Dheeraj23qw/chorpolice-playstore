import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { HelpCircle, MessageCircle, Shield, Mail } from "lucide-react-native";
import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";
import { sendSupportEmail } from "@/utils/supportEmail";

const HelpScreen: React.FC = () => {
  const handleContactSupport = () => {
    sendSupportEmail("User contacted support from Help Center.");
  };

  return (
    <ScreenWrapper title="Help Center" variant="dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-12 pt-6 px-5 bg-slate-950"
      >
        {/* 🛡️ Support Status Card */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="mb-10 flex-row items-center rounded-[36px] bg-indigo-500/10 p-6 border border-indigo-500/20"
        >
          <View className="h-14 w-14 items-center justify-center rounded-3xl bg-indigo-500/20">
            <Shield size={26} color="#6366f1" />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-indigo-400 font-main-bold text-sm tracking-wide">
              Dedicated Player Support
            </Text>
            <Text className="text-indigo-200/60 text-[12px] font-main-md mt-1 leading-4">
              Our team reviews requests and responds as quickly as possible.
            </Text>
          </View>
        </Animated.View>

        {/* 📘 FAQ Section */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          className="rounded-[44px] bg-slate-900/90 p-8 border border-white/5 mb-10"
        >
          <View className="flex-row items-center mb-8">
            <HelpCircle size={20} color="#6366f1" />
            <Text className="ml-3 text-lg font-main-bold text-white">
              Frequently Asked Questions
            </Text>
          </View>

          <View className="mb-8">
            <Text className="text-indigo-400 text-xs font-main-bold uppercase tracking-[1.5px]">
              How do I report a bug?
            </Text>
            <Text className="text-slate-400 text-sm font-main-md mt-2 leading-5">
              Navigate to the Report Bug section from settings and provide a clear description of the issue.
            </Text>
          </View>

          <View className="mb-8">
            <Text className="text-indigo-400 text-xs font-main-bold uppercase tracking-[1.5px]">
              How are scores calculated?
            </Text>
            <Text className="text-slate-400 text-sm font-main-md mt-2 leading-5">
              Detailed rules are available in the{" "}
              <Text className="text-indigo-400 font-main-bold">
                Game Rules
              </Text>{" "}
              section on the main screen.
            </Text>
          </View>

          <View>
            <Text className="text-indigo-400 text-xs font-main-bold uppercase tracking-[1.5px]">
              App feels slow?
            </Text>
            <Text className="text-slate-400 text-sm font-main-md mt-2 leading-5">
              Make sure you're using the latest version. Restarting the app may also improve performance.
            </Text>
          </View>
        </Animated.View>

        {/* 📩 Contact Support */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          className="rounded-[44px] bg-slate-900/90 p-8 border border-white/5"
        >
          <View className="flex-row items-center mb-6">
            <MessageCircle size={20} color="#6366f1" />
            <Text className="ml-3 text-lg font-main-bold text-white">
              Contact Support
            </Text>
          </View>

          <Text className="text-slate-400 text-sm font-main-md mb-8 leading-5">
            Still need assistance? Reach out directly and we’ll guide you through any issue.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleContactSupport}
            className="flex-row items-center justify-center rounded-[28px] bg-indigo-600 py-5 shadow-xl shadow-indigo-500/30"
          >
            <Mail size={18} color="white" strokeWidth={2.5} />
            <Text className="ml-3 text-base font-main-bold text-white tracking-wide">
              Email Support
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HelpScreen;
