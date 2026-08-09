import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
  Modal,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { MotiView, AnimatePresence } from "moti";

import { Text } from "@/components/Text";
import { RootState } from "@/redux/store";
import {
  setQuizNarrationPitch,
  setQuizNarrationRate,
  setQuizNarrationVoiceId,
} from "@/redux/reducers/soundReducer";
import * as QuizNarrationService from "@/service/QuizNarrationService";
import { rf } from "@/utils/responsive";

interface NarrationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const clampProgress = (value: number, min: number, max: number) => {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
};

const StepperRow = memo(function StepperRow({
  label,
  subtitle,
  icon,
  value,
  min,
  max,
  onDecrease,
  onIncrease,
}: any) {
    const progress = clampProgress(value, min, max);
    const canDecrease = value > min;
    const canIncrease = value < max;

    return (
      <View className="mb-3 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20">
              <Ionicons name={icon} size={rf(1.8)} color="#c4b5fd" />
            </View>
            <View>
              <Text
                className="font-main-bold text-white"
                style={{ fontSize: rf(1.45) }}
              >
                {label}
              </Text>
              <Text
                className="font-main-bold text-white/40"
                style={{ fontSize: rf(1.05) }}
              >
                {subtitle}
              </Text>
            </View>
          </View>
          <View className="rounded-full border border-indigo-400/20 bg-indigo-500/20 px-3 py-1">
            <Text
              className="font-main-bold text-indigo-200"
              style={{ fontSize: rf(1.25) }}
            >
              {value.toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <Pressable
            onPress={onDecrease}
            disabled={!canDecrease}
            className={`h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 ${!canDecrease ? "opacity-30" : ""}`}
          >
            <Ionicons name="remove" size={rf(2.1)} color="#FFFFFF" />
          </Pressable>

          <View className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <LinearGradient
              colors={["#38bdf8", "#818cf8", "#c084fc"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: "100%",
                width: `${progress}%`,
                borderRadius: 999,
              }}
            />
          </View>

          <Pressable
            onPress={onIncrease}
            disabled={!canIncrease}
            className={`h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 ${!canIncrease ? "opacity-30" : ""}`}
          >
            <Ionicons name="add" size={rf(2.1)} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    );
});


export const NarrationSettingsModal = ({
  visible,
  onClose,
}: NarrationSettingsModalProps) => {
  const dispatch = useDispatch();
  const { quizNarrationVoiceId, quizNarrationRate, quizNarrationPitch } =
    useSelector((state: RootState) => state.sound);
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      (async () => {
        setLoading(true);
        try {
          const availableVoices = await Speech.getAvailableVoicesAsync();
          const filtered = availableVoices
            .filter((v) => {
              const lang = v.language.toLowerCase();
              const name = (v.name + v.identifier).toLowerCase();
              const isTargetLang = lang.startsWith("en") || lang.startsWith("hi");
              const isFemale =
                name.includes("female") ||
                name.includes("woman") ||
                name.includes("lady") ||
                name.includes("girl");
              return isTargetLang && !isFemale;
            })
            .sort((a, b) => (a.language.includes("-IN") ? -1 : 1));
          setVoices(filtered);

        } finally {
          setLoading(false);
        }
      })();
    }
  }, [visible]);

  const handleTestVoice = useCallback(async () => {
    const testText =
      "Hi player, is this voice okay to you? You can choose the voice you like, the pace and pitch.";
    const language = QuizNarrationService.detectSpeechLanguage(testText);
    let voiceId =
      quizNarrationVoiceId ||
      (await QuizNarrationService.getBestQuizVoice(language));

    await QuizNarrationService.speakQuizQuestion(testText, language, {
      voice: voiceId,
      rate: quizNarrationRate,
      pitch: quizNarrationPitch,
    });
  }, [quizNarrationPitch, quizNarrationRate, quizNarrationVoiceId]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1">
        <AnimatePresence>
          {visible && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex-1 bg-black/60"
            >
              <Pressable className="absolute inset-0" onPress={onClose}>
                <BlurView intensity={20} tint="dark" className="flex-1" />
              </Pressable>

              <View className="flex-1 justify-center px-5">
                <MotiView
                  from={{ opacity: 0, scale: 0.9, translateY: 30 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, translateY: 30 }}
                  transition={{ type: "timing", duration: 250 }}
                  className="max-h-[85%] overflow-hidden rounded-[34px] border border-white/10 bg-slate-900 shadow-2xl"
                >
                  <LinearGradient
                    colors={["rgba(99,102,241,0.15)", "rgba(15,23,42,1)"]}
                    className="absolute inset-0"
                  />

                  <View className="p-6">
                    {/* Header */}
                    <View className="mb-5 flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-indigo-500">
                          <Ionicons
                            name="mic-outline"
                            size={rf(2.5)}
                            color="#FFF"
                          />
                        </View>
                        <View className="ml-3">
                          <Text
                            className="font-main-bold text-white"
                            style={{ fontSize: rf(2.2) }}
                          >
                            Voice Studio
                          </Text>
                          <Text
                            className="font-main-bold uppercase tracking-widest text-cyan-400"
                            style={{ fontSize: rf(1) }}
                          >
                            Narration Tuning
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={onClose}
                        className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
                      >
                        <Ionicons name="close" size={rf(2.2)} color="#FFF" />
                      </Pressable>
                    </View>

                    {/* Preview Card */}
                    <View className="mb-4 flex-row items-center rounded-3xl border border-white/10 bg-white/5 p-4">
                      <View className="flex-1">
                        <Text
                          className="font-main-bold uppercase tracking-tighter text-white/40"
                          style={{ fontSize: rf(1) }}
                        >
                          Current Choice
                        </Text>
                        <Text
                          className="font-main-bold text-white"
                          style={{ fontSize: rf(1.6) }}
                          numberOfLines={1}
                        >
                          {voices.find(
                            (v) => v.identifier === quizNarrationVoiceId,
                          )?.name || "System Default"}
                        </Text>
                      </View>
                      <Pressable
                        onPress={handleTestVoice}
                        className="flex-row items-center rounded-full bg-indigo-600 px-5 py-2.5"
                      >
                        <Ionicons name="play" size={rf(1.8)} color="#FFF" />
                        <Text
                          className="ml-2 font-main-bold uppercase text-white"
                          style={{ fontSize: rf(1.2) }}
                        >
                          Test
                        </Text>
                      </Pressable>
                    </View>

                    {/* Restore Recommended */}
                    <Pressable
                      onPress={() => {
                        dispatch(setQuizNarrationVoiceId("hi-in-x-hie-network"));
                        dispatch(setQuizNarrationRate(0.80));
                        dispatch(setQuizNarrationPitch(0.80));
                      }}
                      className="mb-4 flex-row items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 py-3 active:bg-amber-500/20"
                    >
                      <Ionicons name="sparkles" size={rf(1.6)} color="#fbbf24" />
                      <Text
                        className="ml-2 font-main-bold uppercase text-amber-200"
                        style={{ fontSize: rf(1.2) }}
                      >
                        Restore Recommended Settings
                      </Text>
                    </Pressable>


                    <StepperRow
                      label="Speed"
                      icon="speedometer-outline"
                      value={quizNarrationRate}
                      min={0.5}
                      max={1.5}
                      onDecrease={() =>
                        dispatch(
                          setQuizNarrationRate(
                            Math.max(
                              0.5,
                              Number((quizNarrationRate - 0.1).toFixed(1)),
                            ),
                          ),
                        )
                      }
                      onIncrease={() =>
                        dispatch(
                          setQuizNarrationRate(
                            Math.min(
                              1.5,
                              Number((quizNarrationRate + 0.1).toFixed(1)),
                            ),
                          ),
                        )
                      }
                    />

                    <StepperRow
                      label="Pitch"
                      icon="musical-notes-outline"
                      value={quizNarrationPitch}
                      min={0.5}
                      max={1.5}
                      onDecrease={() =>
                        dispatch(
                          setQuizNarrationPitch(
                            Math.max(
                              0.5,
                              Number((quizNarrationPitch - 0.1).toFixed(1)),
                            ),
                          ),
                        )
                      }
                      onIncrease={() =>
                        dispatch(
                          setQuizNarrationPitch(
                            Math.min(
                              1.5,
                              Number((quizNarrationPitch + 0.1).toFixed(1)),
                            ),
                          ),
                        )
                      }
                    />

                    <Text
                      className="mb-3 mt-2 font-main-bold uppercase tracking-widest text-indigo-300"
                      style={{ fontSize: rf(1.1) }}
                    >
                      Select Voice
                    </Text>

                    <View className="h-48 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                      {loading ? (
                        <ActivityIndicator className="flex-1" color="#818cf8" />
                      ) : (
                        <ScrollView nestedScrollEnabled className="p-2">
                          <VoiceOption
                            title="System Default"
                            selected={!quizNarrationVoiceId}
                            onPress={() =>
                              dispatch(setQuizNarrationVoiceId(undefined))
                            }
                          />
                          {voices.map((v) => (
                            <VoiceOption
                              key={v.identifier}
                              title={v.name}
                              subtitle={v.language.toUpperCase()}
                              selected={quizNarrationVoiceId === v.identifier}
                              onPress={() =>
                                dispatch(setQuizNarrationVoiceId(v.identifier))
                              }
                            />
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  </View>
                </MotiView>
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </Modal>
  );
};

const VoiceOption = ({ title, subtitle, selected, onPress }: any) => (
  <Pressable
    onPress={onPress}
    className={`mb-2 flex-row items-center justify-between rounded-2xl border p-3 ${selected ? "border-indigo-500/50 bg-indigo-500/20" : "border-transparent bg-white/5"}`}
  >
    <View>
      <Text className="font-main-bold text-white" style={{ fontSize: rf(1.3) }}>
        {title}
      </Text>
      {subtitle && (
        <Text
          className="font-main-bold text-white/40"
          style={{ fontSize: rf(0.9) }}
        >
          {subtitle}
        </Text>
      )}
    </View>
    {selected && (
      <Ionicons name="checkmark-circle" size={rf(2)} color="#818cf8" />
    )}
  </Pressable>
);
