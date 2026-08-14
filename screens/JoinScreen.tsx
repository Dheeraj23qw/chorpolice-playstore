import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

import { LobbyBackdrop } from "@/components/LobbyScreen/LobbyBackdrop";
import { LobbyHeader } from "@/components/LobbyScreen/LobbyHeader";
import { toast } from "@/components/feedback/toast";
import {
  joinLanLobby,
  leaveLanLobby,
} from "@/service/lanLobbyCoordinator";
import { setLocalSessionIdentity, setSessionError } from "@/redux/reducers/sessionSlice";
import store, { AppDispatch, RootState } from "@/redux/store";
import { JoinQRSection } from "@/components/JoinScreen/JoinQRSection";
import { MultiplayerHelpModal } from "@/modal/MultiplayerHelpModal";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { LanDebugPanel } from "@/components/LobbyScreen/LanDebugPanel";
import { FloatingDebugToggle } from "@/components/LobbyScreen/FloatingDebugToggle";
import { getJoinHelpShown, setJoinHelpShown } from "@/storage/appStorage";

/* ─────────────────── HELPERS ─────────────────── */
const isValidIpv4 = (value: string) => {
  const parts = value.trim().split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => {
      const n = Number(part);
      return part !== "" && Number.isInteger(n) && n >= 0 && n <= 255;
    })
  );
};

/* ─────────────────── MAIN ─────────────────── */
const JoinScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const session = useSelector((state: RootState) => state.session);
  const selectedImages = useSelector((state: RootState) => state.player.selectedImages);
  const userCoins = useSelector((state: RootState) => state.wallet.coins);

  const [isSmartJoining, setIsSmartJoining] = useState(false);
  const [joiningRoomIp, setJoiningRoomIp] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const isLeavingRef = useRef(false);
  const joinAttemptRef = useRef(false);
  const isJoinScreenFocusedRef = useRef(false);

  const handleBack = useCallback(async () => {
    if (isLeavingRef.current) return;

    isLeavingRef.current = true;
    await leaveLanLobby();
    router.back();
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      isJoinScreenFocusedRef.current = true;
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          void handleBack();
          return true;
        },
      );

      return () => {
        isJoinScreenFocusedRef.current = false;
        subscription.remove();
      };
    }, [handleBack]),
  );

  useEffect(() => {
    console.log("[JoinScreen] Entered Screen");
    if (!getJoinHelpShown()) {
      setShowHelp(true);
    }
    
    return () => {
      const s = store.getState().session;
      if (!isLeavingRef.current && s.connectionStatus !== "CONNECTED" && s.connectionStatus !== "CONNECTING") {
        leaveLanLobby();
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsSmartJoining(false);
      setJoiningRoomIp(null);
      dispatch(setSessionError(null));
      console.log("[JoinScreen] Focus: UI state reset for fresh entry");
    }, [dispatch])
  );

  /* ── Avatar init ── */
  useEffect(() => {
    const avatar = selectedImages[0];
    if (avatar && session.connectionStatus === "IDLE" && avatar !== session.localAvatarId) {
      dispatch(setLocalSessionIdentity({ avatarId: avatar }));
    }
  }, [selectedImages, session.connectionStatus]);

  /* ── Connect ── */
  const handleConnectToIp = useCallback(
    async (
      ip: string,
      port?: number,
    ) => {
      if (isSmartJoining) return;

      if (!isValidIpv4(ip)) {
        toast.error("Invalid Code", "Couldn't decode a valid address.");
        return;
      }
      if (!session.localPlayerId) {
        toast.error("Profile Missing", "Please restart the app.");
        return;
      }

      toast.info("Connecting...", "Joining your friend's room.");
      joinAttemptRef.current = true;
      setIsSmartJoining(true);
      setJoiningRoomIp(ip);

      try {
        await joinLanLobby({
          hostIp: ip,
          hostPort: port,
          localPlayerId: session.localPlayerId,
          name: session.localPlayerName,
          avatarId: session.localAvatarId,
          coins: userCoins,
          gameType: String(params.gameType || "CHOR_POLICE"),
        });
      } finally {
        setIsSmartJoining(false);
        setJoiningRoomIp(null);
      }
    },
    [session, userCoins, params.gameType, isSmartJoining],
  );

  /* ── Auto-nav on connected ── */
  useEffect(() => {
    if (
      isJoinScreenFocusedRef.current &&
      joinAttemptRef.current &&
      (session.connectionStatus === "CONNECTED" ||
        session.connectionStatus === "CONNECTING")
    ) {
      if (session.connectionStatus === "CONNECTED") {
        toast.success("Connected! 🎉", "You joined the lobby.");
      }
      router.replace({ pathname: "/lobby", params: { gameType: params.gameType } } as any);
    }
  }, [session.connectionStatus]);

  /* ─────────────────── UI ─────────────────── */
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={20}
      style={{ flex: 1, backgroundColor: "#050508" }}
    >
      <LobbyBackdrop />

      <LobbyHeader
        onBack={() => void handleBack()}
        onReportPress={() => router.push("/report-bug")}
        rightIcon="help-buoy-outline"
        onRightPress={() => setShowHelp(true)}
      />

      <ScrollView
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingBottom: 32, 
          flexGrow: 1,
          backgroundColor: "#050508" 
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ── */}
        <View style={{ marginBottom: 20, marginTop: 4 }}>
          <Text
            style={{ fontSize: rf(2.8), color: "#fff", letterSpacing: -0.5 }}
            className="font-main-bold"
          >
            Join a Room
          </Text>
          <Text
            style={{ fontSize: rf(1.55), color: "rgba(255,255,255,0.4)", marginTop: 4 }}
            className="font-main-md"
          >
            Scan the host&apos;s QR code to join
          </Text>
        </View>

        {/* ── QR Scan Section ── */}
        <JoinQRSection
          session={session}
          onScan={(payload: any) => {
            if (!payload.host) return;
            handleConnectToIp(
              payload.host,
              payload.port,
            );
          }}
        />
      </ScrollView>

      {/* ── Debug overlay (dev only) ── */}
      {__DEV__ && (
        <>
          <FloatingDebugToggle
            isOpen={showDebug}
            onToggle={() => setShowDebug(!showDebug)}
          />
          <AnimatePresence>
            {showDebug && (
              <MotiView
                from={{ opacity: 0, translateY: 100 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 100 }}
                style={{ position: "absolute", bottom: 80, left: 20, right: 20, zIndex: 998 }}
              >
                <LanDebugPanel />
              </MotiView>
            )}
          </AnimatePresence>
        </>
      )}

      <MultiplayerHelpModal 
        visible={showHelp} 
        onClose={() => {
          setJoinHelpShown(true);
          setShowHelp(false);
        }} 
      />

    </KeyboardAvoidingView>
  );
};

export default JoinScreen;
