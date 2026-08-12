import React, { useState } from "react";
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
  Lightbulb,
  Mail,
  Info,
  Sparkles,
  CheckCircle2,
  Gamepad2,
  Palette,
  Layers,
} from "lucide-react-native";
import { MotiView } from "moti";
import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";
import { sendSupportEmail } from "@/utils/supportEmail";
import Constants from "expo-constants";

const CATEGORIES = [
  { id: "feature", label: "New Feature", icon: Sparkles },
  { id: "gamemode", label: "Game Mode", icon: Gamepad2 },
  { id: "design", label: "Design & UI", icon: Palette },
  { id: "other", label: "General Idea", icon: Layers },
];

export const SuggestionScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("feature");
  const [title, setTitle] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const handleSend = async () => {
    if (!title.trim() || !suggestion.trim()) {
      Alert.alert(
        "Form Incomplete",
        "Please provide both a title and details for your suggestion.",
      );
      return;
    }

    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const categoryLabel =
        CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? "Idea";

      await sendSupportEmail({
        title: `[${categoryLabel}] ${title}`,
        message: suggestion,
        type: "suggestion",
      });

      setIsSuccess(true);
      setTitle("");
      setSuggestion("");

      setTimeout(() => setIsSuccess(false), 3500);
    } catch (error) {
      Alert.alert("Error", "Could not open mail app.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScreenWrapper
      title="Suggestion Box"
      variant="dark"
      subtitle="Share your ideas directly with the developer"
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
          {/* 💡 Header Card */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 100 }}
            className="mb-6 rounded-[24px] border border-amber-400/30 bg-amber-500/10 p-4"
          >
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl border border-amber-400/50 bg-amber-400/20">
                <Lightbulb size={22} color="#fbbf24" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-main-bold text-[13px] text-amber-300">
                  Feature Requests & Ideas
                </Text>
                <Text className="font-main-medium text-[10px] text-amber-200/60">
                  Got a new game mode or cool feature idea? We check every email!
                </Text>
              </View>
            </View>
          </MotiView>

          {/* 🏷️ Category Selector */}
          <View className="mb-6">
            <Text className="mb-2 px-1 font-main-bold text-[10px] uppercase tracking-widest text-slate-400">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.8}
                    className={`flex-row items-center rounded-2xl border-2 px-4 py-3 ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/20 shadow-md shadow-amber-500/20"
                        : "border-slate-700/80 bg-slate-900/80"
                    }`}
                  >
                    <View
                      className={`mr-2.5 h-7 w-7 items-center justify-center rounded-lg ${
                        isSelected ? "bg-amber-400/25" : "bg-slate-800"
                      }`}
                    >
                      <IconComp
                        size={15}
                        color={isSelected ? "#fbbf24" : "#94a3b8"}
                      />
                    </View>
                    <Text
                      className={`font-main-bold text-xs ${
                        isSelected ? "text-amber-300" : "text-slate-300"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 📝 Form Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 150 }}
            className="rounded-[32px] border border-white/10 bg-slate-900 px-6 py-7 shadow-2xl"
          >
            {/* Idea Title */}
            <View className="mb-5">
              <Text className="mb-2 px-1 font-main-bold text-[10px] uppercase tracking-widest text-slate-400">
                Idea Title
              </Text>
              <View
                className={`rounded-2xl border ${
                  title ? "border-amber-400/60" : "border-slate-800"
                } bg-slate-950/60`}
              >
                <TextInput
                  placeholder="e.g. Add Voice Chat in Lobby"
                  placeholderTextColor="#475569"
                  value={title}
                  onChangeText={setTitle}
                  className="p-4 font-main-medium text-sm text-white"
                  selectionColor="#fbbf24"
                />
              </View>
            </View>

            {/* Description */}
            <View className="mb-7">
              <View className="mb-2 flex-row items-center justify-between px-1">
                <Text className="font-main-bold text-[10px] uppercase tracking-widest text-slate-400">
                  Describe Your Feature Idea
                </Text>
                <Text className="font-main-medium text-[9px] text-slate-500">
                  {suggestion.length} chars
                </Text>
              </View>
              <View
                className={`rounded-2xl border ${
                  suggestion ? "border-amber-400/60" : "border-slate-800"
                } bg-slate-950/60`}
              >
                <TextInput
                  placeholder="Tell us how you would like this feature to work..."
                  placeholderTextColor="#475569"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={suggestion}
                  onChangeText={setSuggestion}
                  className="h-36 p-4 font-main-medium text-sm leading-5 text-white"
                  selectionColor="#fbbf24"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={isSending || isSuccess}
              activeOpacity={0.85}
              className={`flex-row items-center justify-center rounded-2xl py-5 ${
                isSuccess
                  ? "bg-emerald-600 shadow-lg shadow-emerald-500/40"
                  : "border-2 border-amber-300/80 bg-amber-500 shadow-xl shadow-amber-500/50"
              }`}
            >
              {isSending ? (
                <ActivityIndicator color={isSuccess ? "white" : "#020617"} />
              ) : isSuccess ? (
                <View className="flex-row items-center">
                  <CheckCircle2 size={22} color="white" />
                  <Text className="ml-2.5 font-main-bold text-base text-white">
                    Email Prepared!
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Mail size={22} color="#020617" />
                  <Text className="ml-3 font-main-bold text-base uppercase tracking-wider text-slate-950">
                    Send Suggestion
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </MotiView>

          {/* Footer Info */}
          <View className="mt-8 items-center px-4">
            <View className="mb-1 flex-row items-center">
              <Info size={12} color="#64748b" />
              <Text className="ml-1 font-main-medium text-[10px] text-slate-400">
                Launches your mail client directly to developer inbox
              </Text>
            </View>
            <Text className="font-main-medium text-[9px] text-slate-600">
              Chor Police . version {appVersion}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default SuggestionScreen;
