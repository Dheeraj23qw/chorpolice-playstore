import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { RootState, AppDispatch } from "@/redux/store";
import { updateOfflinePlayer } from "@/redux/reducers/offlineSessionSlice";
import OfflineRoundSelector from "./components/OfflineRoundSelector";
import { toast } from "@/components/feedback/toast";
import { AudioEngine } from "@/audio/audioEngine";
import { getBotName } from "@/utils/nameGenerator";
import { OfflineAvatarPickerModal } from "./components/OfflineAvatarPickerModal";
import { OfflineSetupBanner } from "./components/OfflineSetupBanner";
import { OfflineStartConfirmModal } from "./components/OfflineStartConfirmModal";
import { OfflineSetupFooter } from "./components/OfflineSetupFooter";
import { OfflineSetupHeader } from "./components/OfflineSetupHeader";
import { OfflineSetupPlayerListCard } from "./components/OfflineSetupPlayerListCard";

const OfflineSetupScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const players = useSelector(
    (state: RootState) => state.offlineSession.players,
  );
  const totalRounds = useSelector(
    (state: RootState) => state.offlineSession.totalRounds,
  );

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPlayerListOpen, setIsPlayerListOpen] = useState(false);

  const closeAvatarModal = useCallback(() => {
    setShowAvatarGrid(false);
    setEditingIndex(null);
  }, []);

  const handleNameChange = useCallback(
    (index: number, name: string) => {
      dispatch(updateOfflinePlayer({ index, name }));
    },
    [dispatch],
  );

  const handleAvatarPress = useCallback((index: number) => {
    AudioEngine.play("select", "ui");
    setEditingIndex(index);
    setShowAvatarGrid(true);
  }, []);

  const handleAvatarSelect = useCallback(
    (avatarId: number) => {
      if (editingIndex === null) return;

      AudioEngine.play("select", "ui");

      const currentAvatarId = players[editingIndex].avatarId;
      if (currentAvatarId === avatarId) {
        closeAvatarModal();
        return;
      }

      const takenByIndex = players.findIndex(
        (player, index) =>
          player.avatarId === avatarId && index !== editingIndex,
      );

      if (takenByIndex !== -1) {
        dispatch(
          updateOfflinePlayer({
            index: takenByIndex,
            avatarId: currentAvatarId,
          }),
        );
      }

      dispatch(updateOfflinePlayer({ index: editingIndex, avatarId }));

      toast.success(
        takenByIndex !== -1 ? "Avatars Swapped" : "Avatar Updated",
        takenByIndex !== -1
          ? "Both players now have unique avatars."
          : "Player avatar changed successfully.",
      );

      closeAvatarModal();
    },
    [editingIndex, players, dispatch, closeAvatarModal],
  );

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
        toast.error(
          "Duplicate Name",
          "Please keep every player name different.",
        );
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

  const handleBack = useCallback(() => {
    AudioEngine.play("select", "ui");
    router.back();
  }, [router]);

  const selectedAvatarIds = useMemo(
    () => (editingIndex !== null ? [players[editingIndex].avatarId] : []),
    [editingIndex, players],
  );

  const isAvatarTaken = useCallback(
    (id: number) =>
      players.some(
        (player, index) => player.avatarId === id && index !== editingIndex,
      ),
    [players, editingIndex],
  );

  const editingPlayerName = useMemo(() => {
    if (editingIndex === null) return "Choose Avatar";
    return players[editingIndex].name || getBotName(editingIndex);
  }, [editingIndex, players]);

  return (
    <View className="flex-1 bg-black">
      <Image
        source={require("@/assets/images/bg/image.webp")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black/84" />

      <LinearGradient
        colors={[
          "rgba(15,23,42,0.62)",
          "rgba(79,70,229,0.12)",
          "rgba(0,0,0,0.92)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 260 }}
          style={{ flex: 1 }}
        >
          <OfflineSetupHeader
            isPlayerListOpen={isPlayerListOpen}
            onBack={handleBack}
          />

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 170 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!isPlayerListOpen && (
              <OfflineSetupBanner playerCount={players.length} />
            )}

            <OfflineSetupPlayerListCard
              isOpen={isPlayerListOpen}
              players={players}
              onToggle={() => setIsPlayerListOpen((prev) => !prev)}
              onNameChange={handleNameChange}
              onAvatarPress={handleAvatarPress}
            />

            {!isPlayerListOpen && (
              <>
                <View className="mt-5 flex-row items-center justify-between">
                  <View>
                    <Text className="font-main-bold text-[12px] uppercase tracking-[3px] text-indigo-300/75">
                      Rounds
                    </Text>
                  </View>

                  <View className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
                    <Text className="font-main-bold text-[11px] text-white/75">
                      {totalRounds} Total
                    </Text>
                  </View>
                </View>

                <OfflineRoundSelector />
              </>
            )}
          </ScrollView>

          <OfflineSetupFooter onPress={handleStartGame} />
        </MotiView>
      </SafeAreaView>

      <OfflineAvatarPickerModal
        visible={showAvatarGrid}
        editingPlayerName={editingPlayerName}
        selectedAvatarIds={selectedAvatarIds}
        isAvatarTaken={isAvatarTaken}
        onClose={closeAvatarModal}
        onSelect={handleAvatarSelect}
      />

      <OfflineStartConfirmModal
        visible={showConfirmModal}
        playerCount={players.length}
        totalRounds={totalRounds}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmStart}
      />
    </View>
  );
};

export default OfflineSetupScreen;
