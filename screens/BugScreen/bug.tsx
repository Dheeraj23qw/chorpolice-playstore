import React, { useEffect, useState } from "react";
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
import { MotiView } from "moti";
import { Text } from "@/components/Text";
import { sendSupportEmail } from "@/utils/supportEmail";
import Constants from "expo-constants";
import { useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/screenwrapper";

const BugsScreen = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const params = useLocalSearchParams<{
    crashId?: string | string[];
    errorMessage?: string | string[];
    errorStack?: string | string[];
  }>();

  /*
   * Expo Router params can technically be string | string[].
   * Normalize them once so the rest of the component only deals with strings.
   */
  const crashId =
    typeof params.crashId === "string" ? params.crashId : undefined;

  const errorMessage =
    typeof params.errorMessage === "string" ? params.errorMessage : undefined;

  const errorStack =
    typeof params.errorStack === "string" ? params.errorStack : undefined;

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  /*
   * If the user arrives here from GlobalErrorBoundary,
   * automatically populate the bug report.
   *
   * Normal/manual navigation has no crashId, so the form remains empty.
   */
  useEffect(() => {
    if (!crashId) {
      return;
    }

    const defaultTitle = `Bug_${crashId}`;

    const defaultDescription = [
      errorMessage ? `Error: ${errorMessage}` : null,
      errorStack ? `Stack:\n${errorStack}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    setTitle(defaultTitle);
    setDescription(defaultDescription || "No error details available.");
  }, [crashId, errorMessage, errorStack]);

  const handleSend = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      Alert.alert(
        "Form Incomplete",
        "Please provide both a title and a description.",
      );
      return;
    }

    if (isSending || isSuccess) {
      return;
    }

    setIsSending(true);

    try {
      // Small UX delay so the loading state is visible.
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 800);
      });

      await sendSupportEmail({
        message: trimmedDescription,
        title: trimmedTitle,
      });

      setIsSuccess(true);

      /*
       * Do not immediately destroy the values before the email
       * workflow has completed. The success state is enough to
       * disable another submission.
       */
      setTitle("");
      setDescription("");

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.warn("[BugsScreen] Failed to send support email:", error);

      Alert.alert("Error", "Could not open the mail app. Please try again.");
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 40,
            paddingHorizontal: 20,
          }}
          className="bg-slate-950"
        >
          {/* ================= PRIORITY SUPPORT ================= */}

          <MotiView
            from={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              type: "spring",
              delay: 100,
            }}
            className="mb-6 rounded-[24px] border border-amber-500/20 bg-amber-500/10"
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

          {/* ================= FORM ================= */}

          <MotiView
            from={{
              opacity: 0,
              translateY: 20,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              type: "timing",
              duration: 500,
              delay: 200,
            }}
            className="rounded-[32px] border border-white/5 bg-slate-900 shadow-2xl"
          >
            <View className="p-6">
              {/* ================= ISSUE TITLE ================= */}

              <View className="mb-6">
                <View className="mb-2 flex-row items-center justify-between px-1">
                  <Text className="font-main-bold text-[10px] uppercase tracking-widest text-slate-500">
                    Issue Title
                  </Text>

                  <Bug size={14} color={title ? "#6366f1" : "#475569"} />
                </View>

                <View
                  className={`rounded-2xl border ${
                    title ? "border-indigo-500/50" : "border-slate-800"
                  } bg-slate-950/50`}
                >
                  <TextInput
                    placeholder="What went wrong?"
                    placeholderTextColor="#475569"
                    value={title}
                    onChangeText={setTitle}
                    editable={!isSending && !isSuccess}
                    selectionColor="#6366f1"
                    autoCapitalize="sentences"
                    autoCorrect
                    className="p-4 font-main-md text-sm text-white"
                  />
                </View>
              </View>

              {/* ================= DESCRIPTION ================= */}

              <View className="mb-8">
                <View className="mb-2 flex-row items-center justify-between px-1">
                  <Text className="font-main-bold text-[10px] uppercase tracking-widest text-slate-500">
                    Details
                  </Text>

                  <Text
                    className={`font-main-md text-[9px] ${
                      description.length > 200
                        ? "text-indigo-400"
                        : "text-slate-600"
                    }`}
                  >
                    {description.length} chars
                  </Text>
                </View>

                <View
                  className={`rounded-2xl border ${
                    description ? "border-indigo-500/50" : "border-slate-800"
                  } bg-slate-950/50`}
                >
                  <TextInput
                    placeholder="Step by step, what happened?"
                    placeholderTextColor="#475569"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                    editable={!isSending && !isSuccess}
                    selectionColor="#6366f1"
                    autoCorrect
                    className="h-32 p-4 font-main-md text-sm leading-5 text-white"
                  />
                </View>
              </View>

              {/* ================= SEND BUTTON ================= */}

              <TouchableOpacity
                onPress={handleSend}
                disabled={isSending || isSuccess}
                activeOpacity={0.8}
                className={`flex-row items-center justify-center overflow-hidden rounded-2xl py-4 ${
                  isSuccess
                    ? "bg-green-500"
                    : isSending
                      ? "bg-indigo-600/70"
                      : "bg-indigo-600"
                }`}
              >
                {isSending ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" />

                    <Text className="ml-3 font-main-bold text-sm text-white">
                      Preparing...
                    </Text>
                  </View>
                ) : isSuccess ? (
                  <View className="flex-row items-center">
                    <CheckCircle2 size={20} color="white" />

                    <Text className="ml-2 font-main-bold text-white">
                      Email Prepared
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Mail size={20} color="white" />

                    <Text className="ml-3 font-main-bold text-sm text-white">
                      Send Report
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </MotiView>

          {/* ================= FOOTER ================= */}

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
