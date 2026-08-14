import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Bug,
  Mail,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";
import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";
import { sendSupportEmail } from "@/utils/supportEmail";
import Constants from "expo-constants";
import { useLocalSearchParams } from "expo-router";

const BugsScreen = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const params = useLocalSearchParams();

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  useEffect(() => {
    const crashId = params.crashId as string | undefined;
    const errorMessage = params.errorMessage as string | undefined;
    const errorStack = params.errorStack as string | undefined;

    if (!crashId) return;

    const defaultTitle = `Bug_${crashId}`;
    const defaultDescription = [
      errorMessage ? `Error: ${errorMessage}` : null,
      errorStack ? `Stack:\n${errorStack}` : null,
    ].filter(Boolean).join("\n\n") || "No error details available.";

    setTitle(defaultTitle);
    setDescription(defaultDescription);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [params.crashId, params.errorMessage, params.errorStack]);

  const handleSend = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(
        "Form Incomplete",
        "Please provide both a title and a description.",
      );
      return;
    }

    setIsSending(true);
    try {
      // Small delay for UX feel so the user sees the loading state
      await new Promise((resolve) => setTimeout(resolve, 800));

      // ✅ FIX: Wrap arguments in an object to match the new utility signature
      await sendSupportEmail({
        message: description,
        title: title,
      });

      setIsSuccess(true);
      setTitle("");
      setDescription("");

      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      Alert.alert("Error", "Could not open mail app.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScreenWrapper
      title="Report Bug"
      variant="dark"
      subtitle="Direct line to the developers"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            paddingTop: 16,
            paddingHorizontal: 20,
          }}
          className="bg-slate-950"
        >
          {/* 🛡️ Status Header - Animated Entrance */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 100 }}
            className="rounded-[24px] border border-amber-500/20 bg-amber-500/10"
            style={{ marginBottom: 24 }}
          >
            <View className="flex-row items-center p-4">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
              <AlertTriangle size={20} color="#fbbf24" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-main-bold text-[13px] text-amber-400">
                Priority Support
              </Text>
              <Text className="font-main-md text-[10px] text-amber-200/50">
                Reports are usually reviewed within 24 hours.
              </Text>
            </View>
            </View>
          </MotiView>

          {/* 📝 Form Container */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 200 }}
            className="rounded-[32px] border border-white/5 bg-slate-900 shadow-2xl"
          >
            <View className="p-6">
            {/* Issue Title */}
            <View className="mb-6">
              <View className="mb-2 flex-row items-center justify-between px-1">
                <Text className="font-main-bold text-[10px] uppercase tracking-widest text-slate-500">
                  Issue Title
                </Text>
                <Bug size={14} color={title ? "#6366f1" : "#475569"} />
              </View>

              <View
                className={`rounded-2xl border ${title ? "border-indigo-500/50" : "border-slate-800"} bg-slate-950/50`}
              >
                <TextInput
                  placeholder="What went wrong?"
                  placeholderTextColor="#475569"
                  value={title}
                  onChangeText={setTitle}
                  className="p-4 font-main-md text-sm text-white"
                  selectionColor="#6366f1"
                />
              </View>
            </View>

            {/* Description */}
            <View className="mb-8">
              <View className="mb-2 flex-row items-center justify-between px-1">
                <Text className="font-main-bold text-[10px] uppercase tracking-widest text-slate-500">
                  Details
                </Text>
                <Text
                  className={`font-main-md text-[9px] ${description.length > 200 ? "text-indigo-400" : "text-slate-600"}`}
                >
                  {description.length} chars
                </Text>
              </View>

              <View
                className={`rounded-2xl border ${description ? "border-indigo-500/50" : "border-slate-800"} bg-slate-950/50`}
              >
                <TextInput
                  placeholder="Step by step, what happened?"
                  placeholderTextColor="#475569"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                  className="h-32 p-4 font-main-md text-sm leading-5 text-white"
                  selectionColor="#6366f1"
                />
              </View>
            </View>

            {/* 💎 Premium Action Button */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={isSending || isSuccess}
              activeOpacity={0.8}
              className={`flex-row items-center justify-center overflow-hidden rounded-2xl py-4 ${
                isSuccess ? "bg-green-500" : "bg-indigo-600"
              }`}
            >
              {isSending ? (
                <ActivityIndicator color="white" />
              ) : isSuccess ? (
                <View className="flex-row items-center">
                  <CheckCircle2 size={20} color="white" className="mr-2" />
                  <Text className="ml-2 font-main-bold text-white">
                    Email Prepared
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Mail size={20} color="white" />
                  <View className="ml-3">
                    <Text className="font-main-bold text-sm text-white">
                      Send Report
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
            </View>
          </MotiView>

          {/* Footer Info */}
          <View className="mt-8 items-center px-4">
            <View className="mb-1 flex-row items-center">
              <Info size={12} color="#475569" />
              <Text className="ml-1 font-main-md text-[10px] text-slate-500">
                System logs will be attached automatically
              </Text>
            </View>
            <Text className="font-main-md text-[9px] text-slate-700">
              Chor Police . version {appVersion}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default BugsScreen;
