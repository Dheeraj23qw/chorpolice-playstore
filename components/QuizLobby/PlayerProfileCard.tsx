import React from "react";
import { View, Pressable, TextInput, Image } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Text } from "@/components/Text";
import { DIFFICULTY_OPTIONS } from "@/constants/difficultyConfig";
import RoundSelector from "@/screens/RoundSelector";

export const PlayerProfileCard = ({ lobby, getAvatarSource }: any) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(100).duration(500)}
      className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5"
    >
      <View className="mb-4 flex-row items-center justify-between">
        <View className="mr-4 flex-1">
          <Text className="text-[10px] text-white/30">Identity</Text>
          <TextInput
            value={lobby.userName}
            onChangeText={lobby.handleNameChange}
            placeholder="Enter Name..."
            placeholderTextColor="rgba(255,255,255,0.2)"
            className="text-xl text-white"
          />
        </View>

        <Pressable
          onPress={() => lobby.setShowAvatarGrid(!lobby.showAvatarGrid)}
          className="h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/20"
        >
          <Image
            source={getAvatarSource(lobby.selectedImages[0] || 1)}
            className="h-12 w-12"
          />
        </Pressable>
      </View>

      {/* QUIZ: Difficulty selector */}
      {lobby.isHost && lobby.gameType === "QUIZ" && (
        <View className="mt-2">
          <Text className="mb-3 text-[10px] text-white/30">
            Round Difficulty
          </Text>

          <View className="flex-row rounded-2xl bg-black/40 p-1.5">
            {DIFFICULTY_OPTIONS.map((opt: any) => (
              <Pressable
                key={opt}
                onPress={() => lobby.handleDifficultyChange(opt)}
                className={`flex-1 items-center py-2 ${
                  lobby.difficulty === opt ? "bg-purple-600" : ""
                }`}
              >
                <Text
                  className={
                    lobby.difficulty === opt ? "text-white" : "text-white/30"
                  }
                >
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* CHOR POLICE: Round selector */}
      {lobby.isHost && lobby.gameType === "CHOR_POLICE" && (
        <View className="mt-4">
          <RoundSelector />
        </View>
      )}
    </Animated.View>
  );
};
