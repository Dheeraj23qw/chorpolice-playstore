import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, TouchableOpacity, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { RootState, AppDispatch } from "@/redux/store";
import { updateOfflinePlayer } from "@/redux/reducers/offlineSessionSlice";
import { OfflinePlayerCard } from "./components/OfflinePlayerCard";
import OfflineRoundSelector from "./components/OfflineRoundSelector";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";
import { toast } from "@/components/feedback/toast";
import { AudioEngine } from "@/audio/audioEngine";
import { rf, wp, hp } from "@/utils/responsive";
import { getBotName } from "@/utils/nameGenerator";

const OfflineSetupScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const players = useSelector((state: RootState) => state.offlineSession.players);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const closeAvatarModal = useCallback(() => {
    setShowAvatarGrid(false);
    setEditingIndex(null);
  }, []);

  const handleNameChange = useCallback((index: number, name: string) => {
    dispatch(updateOfflinePlayer({ index, name }));
  }, [dispatch]);

  const handleAvatarPress = useCallback((index: number) => {
    AudioEngine.play("select", "ui");
    setEditingIndex(index);
    setShowAvatarGrid(true);
  }, []);

  const handleAvatarSelect = useCallback((avatarId: number) => {
    if (editingIndex === null) return;
    AudioEngine.play("select", "ui");

    const currentAvatarId = players[editingIndex].avatarId;
    if (currentAvatarId === avatarId) {
      closeAvatarModal();
      return;
    }

    const takenByIndex = players.findIndex(
      (player, index) => player.avatarId === avatarId && index !== editingIndex,
    );

    if (takenByIndex !== -1) {
      dispatch(updateOfflinePlayer({ index: takenByIndex, avatarId: currentAvatarId }));
      dispatch(updateOfflinePlayer({ index: editingIndex, avatarId }));
      toast.success("Avatars Swapped", "Both players now have unique avatars.");
      closeAvatarModal();
      return;
    }

    dispatch(updateOfflinePlayer({ index: editingIndex, avatarId }));
    toast.success("Avatar Updated", "Player avatar changed successfully.");
    closeAvatarModal();
  }, [editingIndex, players, dispatch, closeAvatarModal]);

  const confirmStart = useCallback(() => {
    AudioEngine.play("select", "ui");
    const usedNames = new Set<string>();

    for (let index = 0; index < players.length; index++) {
      const fallbackName = getBotName(index);
      const name = players[index].name || "";
      const cleanName = name.trim() || fallbackName;
      const normalizedName = cleanName.toLowerCase();

      if (!name.trim()) {
        dispatch(updateOfflinePlayer({ index, name: cleanName }));
      }

      if (usedNames.has(normalizedName)) {
        toast.error("Duplicate Name", "Please keep every player name different.");
        setShowConfirmModal(false);
        return;
      }
      usedNames.add(normalizedName);
    }

    setShowConfirmModal(false);
    router.push("/offline-game");
  }, [players, dispatch, router]);

  const handleStartGame = useCallback(() => {
    AudioEngine.play("select", "ui");
    setShowConfirmModal(true);
  }, []);

  const handleBack = useCallback(() => router.back(), [router]);

  const selectedAvatarIds = useMemo(() => 
    editingIndex !== null ? [players[editingIndex].avatarId] : [], 
    [editingIndex, players]
  );

  const isAvatarTaken = useCallback((id: number) => 
    players.some((p, i) => p.avatarId === id && i !== editingIndex),
    [players, editingIndex]
  );

  return (
    <View className="flex-1 bg-black">
      <View style={{ backgroundColor: '#000' }} className="absolute inset-0">
        <LinearGradient colors={["#0F172A", "#000000"]} className="flex-1" />
        <MotiView 
            from={{ opacity: 0 }} 
            animate={{ opacity: 0.3 }} 
            transition={{ duration: 1000 }}
            className="absolute inset-0"
        >
          <LinearGradient colors={["#6366F1", "transparent"]} className="h-1/2 w-full" />
        </MotiView>
      </View>

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <MotiView 
            from={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ type: 'timing', duration: 400 }}
            className="flex-1"
        >
          <View className="flex-row items-center px-6 py-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBack}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <View className="ml-4 flex-1">
              <Text style={{ fontSize: rf(2.2) }} className="font-main-bold text-white">Pass & Play</Text>
              <Text style={{ fontSize: rf(1.1) }} className="text-white/50">No extra phones? No problem — just pass and play.</Text>
            </View>
          </View>

          <View className="mb-4 flex-row items-center justify-between px-1 mt-2">
            <View className="flex-row items-center">
              <View className="mr-3 h-5 w-1.5 rounded-full bg-indigo-500" />
              <View>
                <Text style={{ fontSize: rf(1.1) }} className="font-main-bold uppercase tracking-[3px] text-white/45">Player Profiles</Text>
                <Text style={{ fontSize: rf(1.25) }} className="mt-1 text-white/70">You can change name and avatar here</Text>
              </View>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: wp(6), paddingBottom: hp(15) }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-y-4">
                {players.map((player, index) => (
                <OfflinePlayerCard
                    key={player.id}
                    player={player}
                    index={index}
                    onNameChange={(name) => handleNameChange(index, name)}
                    onAvatarPress={() => handleAvatarPress(index)}
                />
                ))}
                <OfflineRoundSelector />
            </View>
          </ScrollView>

          <View 
            style={{ paddingBottom: hp(4) }}
            className="absolute bottom-0 w-full border-t border-white/10 bg-black/80 px-6 pt-6"
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleStartGame}
              className="h-16 w-full items-center justify-center overflow-hidden rounded-2xl"
            >
              <LinearGradient colors={["#6366F1", "#4F46E5"]} className="absolute h-full w-full" />
              <Text style={{ fontSize: rf(1.6) }} className="font-main-bold text-white uppercase tracking-wider">Start Offline Game</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </SafeAreaView>

      <Modal visible={showAvatarGrid} transparent animationType="fade">
        <View className="flex-1 bg-black/80">
          <Pressable className="flex-1" onPress={closeAvatarModal} />
          <MotiView
            from={{ translateY: 600 }}
            animate={{ translateY: 0 }}
            transition={{ type: "timing", duration: 280 }}
            style={{ height: hp(70) }}
            className="mt-auto rounded-t-[36px] bg-[#0A0A0C] p-6"
          >
            <View className="mb-6 flex-row items-center justify-between">
              <View>
                <Text style={{ fontSize: rf(1.8) }} className="font-main-bold text-white">
                  {editingIndex !== null ? (players[editingIndex].name || getBotName(editingIndex)) : "Choose Avatar"}
                </Text>
                <Text style={{ fontSize: rf(1.0) }} className="mt-1 text-white/45">Selecting a used avatar will swap it automatically.</Text>
              </View>
              <TouchableOpacity activeOpacity={0.8} onPress={closeAvatarModal}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <ImageGrid
              selectedImages={selectedAvatarIds}
              handleImageSelect={handleAvatarSelect}
              gameMode="ONLINE"
              isTaken={isAvatarTaken}
            />
          </MotiView>
        </View>
      </Modal>

      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
            <MotiView 
                from={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full rounded-[32px] border border-white/20 bg-[#0A0A0C] p-8 shadow-2xl"
            >
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 mx-auto">
                    <Ionicons name="person-add-outline" size={32} color="#6366F1" />
                </View>
                <Text style={{ fontSize: rf(2.2) }} className="text-center font-main-bold text-white mb-2">Ready to Play?</Text>
                <Text style={{ fontSize: rf(1.1) }} className="text-center text-white/50 mb-8">Did you want to change any names or avatars before starting the game?</Text>
                
                <View className="gap-y-3">
                    <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={() => setShowConfirmModal(false)}
                        className="h-14 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5"
                    >
                        <Text className="font-main-bold text-white">Yes, I want to change</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={confirmStart}
                        className="h-16 w-full items-center justify-center rounded-2xl bg-indigo-500"
                    >
                        <Text className="font-main-bold text-white text-lg">No, Start Game</Text>
                    </TouchableOpacity>
                </View>
            </MotiView>
        </View>
      </Modal>
    </View>
  );
};

export default OfflineSetupScreen;
