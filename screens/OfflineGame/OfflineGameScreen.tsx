import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Image, TouchableOpacity, ScrollView, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { rf, wp, hp } from "@/utils/responsive";
import { useOfflineChorPolice } from "@/hooks/useOfflineChorPolice";
import { playerImages } from "@/constants/playerData";
import PlayButton from "@/components/RajamantriGameScreen/playButton";
import CinematicReveal from "../ChorPoliceMultiplayer/components/CinematicReveal";
import OverlayPopUp from "@/modal/overlaypop";
import { AudioEngine } from "@/audio/audioEngine";

// Modular Components
import { OfflineCard } from "./components/OfflineCard";
import { OfflineResultOverlay } from "./components/OfflineResultOverlay";

const OfflineGameScreen = () => {
  const router = useRouter();
  const g = useOfflineChorPolice();
  
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [showScores, setShowScores] = useState(false);
  const [showResultCinematic, setShowResultCinematic] = useState(false);
  const [showOverlayPopup, setShowOverlayPopup] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const animStyle = useMemo(() => (g.currentRound - 1) % 4, [g.currentRound]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (g.phase === "dealing") {
      setFlippedIndices(prev => prev.size > 0 ? new Set() : prev);
      setShowFinalSummary(false);
      setShowResultCinematic(false);
      setShowOverlayPopup(false);
      setIsSpinning(true);
      
      timer = setTimeout(() => {
        setIsSpinning(false);
        setFlippedIndices(prev => {
          const next = new Set(prev);
          if (g.kingIndex !== null && g.kingIndex !== undefined) next.add(g.kingIndex);
          if (g.policeIndex !== null && g.policeIndex !== undefined) next.add(g.policeIndex);
          return next;
        });
        AudioEngine.play("level", "gameplay");
      }, 2500); 
    } else if (g.phase === "result") {
      setShowResultCinematic(true);
      setFlippedIndices(new Set([0, 1, 2, 3]));
      AudioEngine.play(g.result?.winner === "police" ? "win" : "lose", "gameplay");
    } else if (g.phase === "idle") {
      setFlippedIndices(new Set());
      setShowFinalSummary(false);
      setShowResultCinematic(false);
      setShowOverlayPopup(false);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [g.phase, g.kingIndex, g.policeIndex, g.result?.winner]);

  const handleCardClick = useCallback((index: number) => {
    if (g.phase === "police_turn") {
      if (index === g.policeIndex || index === g.kingIndex) return;
      g.handlePoliceGuess(index);
    }
  }, [g.phase, g.policeIndex, g.kingIndex, g.handlePoliceGuess]);

  const handleNextRound = useCallback(() => {
    AudioEngine.play("select", "ui");
    if (g.currentRound < g.totalRounds) {
      g.nextRound();
    } else {
      router.dismissAll();
      router.replace("/");
    }
  }, [g.currentRound, g.totalRounds, g.nextRound, router]);

  const handleBack = useCallback(() => {
    AudioEngine.play("select", "ui");
    router.back();
  }, [router]);

  const toggleLeaderboard = useCallback((visible: boolean) => {
    AudioEngine.play("select", "ui");
    setShowScores(visible);
  }, []);

  const onOverlayStateChange = useCallback((visible: boolean) => {
    if (!visible) {
      setShowOverlayPopup(false);
      setShowFinalSummary(true);
    }
  }, []);

  const onCinematicComplete = useCallback(() => {
    setShowResultCinematic(false);
    setShowOverlayPopup(true);
  }, []);

  const buttonText = useMemo(() => {
    if (g.phase === "idle") return "Press me to play!";
    if (g.phase === "dealing") return "Dealing roles...";
    if (g.phase === "police_turn") {
        const policeName = g.players[g.policeIndex ?? 0]?.name || "Police";
        return `${policeName}, find the Thief! 🔍`;
    }
    return "Round Complete!";
  }, [g.phase, g.players, g.policeIndex]);

  // Safety card renderer
  const renderCard = (idx: number) => {
    const player = g.players[idx] || { name: `Player ${idx + 1}`, avatarId: idx + 1 };
    const role = g.roles[idx] || "Unknown";
    const isFlipped = flippedIndices.has(idx);
    
    // 💡 Highlight cards that can be clicked during the Police's turn
    const isHighlight = g.phase === "police_turn" && !isFlipped;

    return (
      <OfflineCard
        key={idx}
        index={idx}
        player={player}
        role={role}
        isFlipped={isFlipped}
        isClicked={g.clickedIndex === idx}
        isDealing={g.phase === "dealing" && !isSpinning}
        isSpinning={isSpinning}
        animStyle={animStyle}
        onPress={handleCardClick}
        disabled={isFlipped || g.phase !== "police_turn"}
        phase={g.phase}
        isHighlight={isHighlight}
      />
    );
  };

  return (
    <View className="flex-1 bg-black">
      <Image source={require("@/assets/images/bg/image.webp")} className="absolute h-full w-full" resizeMode="cover" />
      <View className="absolute h-full w-full bg-black/80" />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={handleBack} className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="font-main-bold uppercase tracking-[2px] text-indigo-300">Offline Mode</Text>
            <Text className="text-[10px] text-white/40">Round {g.currentRound} / {g.totalRounds}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleLeaderboard(true)} className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="podium-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Board */}
        {!showResultCinematic && !showOverlayPopup && !showFinalSummary && (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} className="px-6" showsVerticalScrollIndicator={false}>
            <View className="mb-8 mt-4 items-center">
              <View className="relative overflow-hidden rounded-full border border-white/20 bg-white/10 px-6 py-2">
                <View className="absolute inset-x-2 top-0 h-[1px] rounded-full bg-white/30" />
                <Text style={{ fontSize: rf(1.4), letterSpacing: wp(1) }} className="font-main-bold uppercase text-indigo-300">ROUND — {g.currentRound}</Text>
              </View>
            </View>

            <View className="mb-9">
              <PlayButton
                disabled={g.phase !== "idle"}
                onPress={() => { AudioEngine.play("select", "ui"); g.handlePlay(); }}
                buttonText={buttonText}
              />
            </View>

            <View className="gap-y-8 pb-10">
                <View className="flex-row justify-between">
                  {renderCard(0)}
                  {renderCard(1)}
                </View>
                <View className="flex-row justify-between">
                  {renderCard(2)}
                  {renderCard(3)}
                </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Cinematic Reveal Sequence */}
      {showResultCinematic && g.result && (
        <CinematicReveal
          index={g.clickedIndex!}
          role={g.roles[g.clickedIndex!]}
          isCorrect={g.result.winner === "police"}
          policeName={g.players[g.policeIndex ?? 0]?.name}
          advisorName={g.roles[g.clickedIndex!] === "Advisor" ? g.players[g.clickedIndex!].name : undefined}
          onComplete={onCinematicComplete}
        />
      )}

      {/* Win/Loss Popup */}
      {showOverlayPopup && g.result && (
        <OverlayPopUp
          index={g.result.winner === "police" ? 4 : 3}
          policeIndex={g.policeIndex ?? 0}
          thiefIndex={g.thiefIndex ?? 0}
          kingIndex={g.kingIndex ?? 0}
          advisorIndex={g.advisorIndex ?? 0}
          onStateChange={onOverlayStateChange}
        />
      )}

      {/* Final Score Summary */}
      <OfflineResultOverlay
        visible={showFinalSummary}
        result={g.result}
        players={g.players}
        roles={g.roles}
        currentRound={g.currentRound}
        totalRounds={g.totalRounds}
        onNextRound={handleNextRound}
      />

      {/* Leaderboard Modal */}
      <Modal visible={showScores} transparent animationType="slide">
        <View className="flex-1 bg-black/80">
          <Pressable className="flex-1" onPress={() => toggleLeaderboard(false)} />
          <MotiView from={{ translateY: 600 }} animate={{ translateY: 0 }} className="mt-auto rounded-t-[40px] border-t border-white/10 bg-[#0a0a0c] p-8 pb-12">
            <View className="mb-8 flex-row items-center justify-between">
              <Text className="font-main-bold text-2xl text-white">Leaderboard</Text>
              <TouchableOpacity onPress={() => toggleLeaderboard(false)}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
            </View>
            <View className="gap-y-4">
              {g.players.map((p, i) => (
                <View key={i} className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
                  <View className="flex-row items-center">
                    <Image source={playerImages[p.avatarId]?.src || playerImages[1].src} className="mr-4 h-12 w-12 rounded-full" />
                    <Text className="font-main-bold text-lg text-white">{p.name || `Player ${i + 1}`}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-main-bold text-xl text-indigo-400">{g.scores[i] || 0}</Text>
                    <Text className="text-[10px] uppercase tracking-widest text-white/30">Total Points</Text>
                  </View>
                </View>
              ))}
            </View>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
};

export default OfflineGameScreen;
