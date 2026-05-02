import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { LobbyBackdrop } from "@/components/LobbyScreen/LobbyBackdrop";
import { LobbyHeader } from "@/components/LobbyScreen/LobbyHeader";
import { toast } from "@/components/feedback/toast";
import { useNetworkPermissions } from "@/hooks/useNetworkPermissions";
import {
  decodeLanRoomCode,
  joinLanLobby,
  leaveLanLobby,
} from "@/service/lanLobbyCoordinator";
import { setLocalSessionIdentity } from "@/redux/reducers/sessionSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { JoinHeaderBlock } from "@/components/JoinScreen/JoinHeaderBlock";
import { JoinStepsCard } from "@/components/JoinScreen/JoinStepsCard";
import { JoinMethodToggle } from "@/components/JoinScreen/JoinMethodToggle";
import { JoinQRSection } from "@/components/JoinScreen/JoinQRSection";
import { JoinCodeSection } from "@/components/JoinScreen/JoinCodeSection";
import { MultiplayerHelpModal } from "@/modal/MultiplayerHelpModal";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

/* ---------------- HELPERS ---------------- */
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

/* ---------------- NETWORK BANNER for Join Screen ---------------- */
const JoinNetworkBanner = ({
  status,
  networkContext,
  errorMessage,
  onRetry,
  onOpenSettings,
}: any) => {
  if (status === "granted" || status === "pending") return null;

  let icon = "wifi-outline";
  let color = "#f97316";
  let title = "Network Issue";
  let subtitle = errorMessage || "Connect to the host's WiFi or Hotspot to join.";
  let actionLabel = "Retry";
  let onAction = onRetry;

  if (status === "denied") {
    icon = "lock-closed-outline";
    color = "#ef4444";
    title = "Permission Required";
    subtitle = errorMessage || "Location permission needed to find local games.";
    const isPermanent = errorMessage?.includes("permanently") || errorMessage?.includes("Settings");
    actionLabel = isPermanent ? "Open Settings" : "Grant Permission";
    onAction = isPermanent ? onOpenSettings : onRetry;
  } else if (status === "no_wifi" && networkContext === "none") {
    title = "No Network Detected";
    subtitle = "Connect to the same WiFi or Mobile Hotspot as the host.";
  } else if (status === "error") {
    icon = "alert-circle-outline";
    color = "#ef4444";
    title = "Connection Error";
    subtitle = errorMessage || "Something went wrong. Please retry.";
  }

  return (
    <AnimatePresence>
      <MotiView
        from={{ opacity: 0, translateY: -6 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -6 }}
        transition={{ type: "timing", duration: 280 }}
        className="mb-4 overflow-hidden rounded-2xl"
        style={{
          borderWidth: 1,
          borderColor: `${color}40`,
          backgroundColor: `${color}12`,
          borderRadius: 16,
          padding: 14,
        }}
      >
        <View className="flex-row items-start gap-3">
          <Ionicons name={icon as any} size={rf(2.2)} color={color} style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text style={{ fontSize: rf(1.7), color }} className="font-main-bold">
              {title}
            </Text>
            <Text
              style={{ fontSize: rf(1.45) }}
              className="mt-1 font-main-md text-white/60"
            >
              {subtitle}
            </Text>
            <Pressable
              onPress={onAction}
              className="mt-3 self-start rounded-xl px-4 py-2"
              style={{
                backgroundColor: `${color}20`,
                borderWidth: 1,
                borderColor: `${color}45`,
              }}
            >
              <Text
                style={{ fontSize: rf(1.35), color }}
                className="font-main-bold uppercase tracking-wide"
              >
                {actionLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </MotiView>
    </AnimatePresence>
  );
};

/* ---------------- MAIN ---------------- */
const JoinScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const session = useSelector((state: RootState) => state.session);
  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );
  const userCoins = useSelector((state: RootState) => state.wallet.coins);

  const [isLanModeRequested, setIsLanModeRequested] = useState(false);

  const { step, status, retry, errorMessage, openSettings, networkContext } =
    useNetworkPermissions({
      enabled: isLanModeRequested,
      requireWifiIpAddress: false,
      requireAndroidWifiPermissions: false,
    });

  const [roomCode, setRoomCode] = useState("");
  const [joinMethod, setJoinMethod] = useState<"scan" | "code">("scan");
  const [showHelp, setShowHelp] = useState(false);

  const gameType = String(params.gameType || "CHOR_POLICE");

  const isConnecting = session.connectionStatus === "CONNECTING";
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTroubleshooting(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- AVATAR INIT ---------------- */
  useEffect(() => {
    const avatar = selectedImages[0];
    if (
      avatar &&
      session.connectionStatus === "IDLE" &&
      avatar !== session.localAvatarId
    ) {
      dispatch(setLocalSessionIdentity({ avatarId: avatar }));
    }
  }, [selectedImages, session.connectionStatus]);

  /* ---------------- SMART TOAST ON STATUS CHANGE ---------------- */
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prev === status) return;

    if (status === "no_wifi" && networkContext === "none") {
      toast.error("No Network", "Connect to the host's WiFi or Hotspot to join.");
    } else if (status === "denied") {
      toast.error("Permission Needed", "Grant Location permission to find local games.");
    } else if (status === "granted" && (prev === "no_wifi" || prev === "denied" || prev === "error")) {
      toast.success("Network Ready ✓", "You can now scan or enter a room code.");
    }
  }, [status, networkContext]);

  /* ---------------- SESSION ERROR TOASTS ---------------- */
  useEffect(() => {
    if (session.connectionStatus === "ERROR" && session.errorMessage) {
      toast.error("Connection Failed", session.errorMessage);
    }
  }, [session.connectionStatus, session.errorMessage]);

  /* ---------------- CONNECT ---------------- */
  const handleConnectToIp = useCallback(
    async (ip: string, port?: number) => {
      console.log(
        `[JoinScreen] 🔗 Connect attempt: ip=${ip}, port=${port ?? "default"}, ` +
        `status=${status}, networkCtx=${networkContext}, playerId=${session.localPlayerId || "null"}`,
      );

      // 🚀 ACTIVATE LAN: If not yet requested, enable it now.
      if (!isLanModeRequested) {
        setIsLanModeRequested(true);
        // We don't return here, we let the logic below check the status.
        // It might be 'pending' or 'idle' for a moment, but joinLanLobby handles retries.
      }

      // Block only if truly no network — not for permission issues
      if (status === "no_wifi" && networkContext === "none") {
        console.log(`[JoinScreen] ❌ Blocked: no network`);
        toast.error(
          "No Network",
          "Connect to the host's WiFi or Mobile Hotspot first.",
        );
        return;
      }

      if (!isValidIpv4(ip)) {
        console.log(`[JoinScreen] ❌ Invalid IP: ${ip}`);
        toast.error("Invalid Code", "The room code couldn't be decoded to a valid address.");
        return;
      }

      if (!session.localPlayerId) {
        console.log(`[JoinScreen] ❌ No local player ID`);
        toast.error("Profile Missing", "Your player profile isn't set up. Please restart the app.");
        return;
      }

      console.log(
        `[JoinScreen] ✅ Joining: ip=${ip}, port=${port ?? "default"}, ` +
        `player=${session.localPlayerId}, name=${session.localPlayerName}, avatar=${session.localAvatarId}`,
      );
      toast.info("Connecting...", `Reaching ${ip} on local network.`);

      await joinLanLobby({
        hostIp: ip,
        hostPort: port,
        localPlayerId: session.localPlayerId,
        name: session.localPlayerName,
        avatarId: session.localAvatarId,
        coins: userCoins,
        gameType,
      });
    },
    [status, networkContext, session, userCoins, gameType],
  );

  /* ---------------- AUTO NAV ---------------- */
  useEffect(() => {
    if (session.connectionStatus === "CONNECTED") {
      toast.success("Connected! 🎉", `You joined the lobby.`);
      if (session.players.length === 4) {
        router.replace({
          pathname: "/lobby",
          params: { gameType },
        } as any);
      }
    }
  }, [session.connectionStatus, session.players.length]);

  /* ---------------- ROOM CODE CONNECT ---------------- */
  const handleRoomCodeConnect = useCallback(async () => {
    if (!roomCode || roomCode.length < 3) {
      toast.error("Invalid Code", "Enter the 3-digit code shown on the host's screen.");
      return;
    }

    const decoded = await decodeLanRoomCode(roomCode);
    if (!decoded) {
      toast.error(
        "Code Not Recognized",
        "Make sure you entered the correct code and are on the same WiFi/Hotspot.",
      );
      return;
    }

    await handleConnectToIp(decoded.ip, decoded.port);
  }, [roomCode, handleConnectToIp]);

  /* ---------------- UI ---------------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <LobbyBackdrop />
      <LobbyHeader
        onBack={async () => {
          await leaveLanLobby();
          router.back();
        }}
        onReportPress={() => router.push("/report-bug")}
        rightIcon="help-buoy-outline"
        onRightPress={() => setShowHelp(true)}
      />

      <View className="flex-1 px-6 pb-8">
        {/* HEADER */}
        <JoinHeaderBlock />

        {/* STEPS */}
        <JoinStepsCard />

        {/* 🚀 NETWORK BANNER — shown only when LAN is active */}
        {isLanModeRequested && (
          <JoinNetworkBanner
            status={status}
            networkContext={networkContext}
            errorMessage={errorMessage}
            onRetry={retry}
            onOpenSettings={openSettings}
          />
        )}

        {/* CONTENT AREA */}
        <JoinMethodToggle
          joinMethod={joinMethod}
          setJoinMethod={setJoinMethod}
        />

        {joinMethod === "scan" ? (
          <JoinQRSection
            session={session}
            onScan={(payload: any) => {
              if (!payload.ip) return;
              handleConnectToIp(payload.ip, payload.port);
            }}
          />
        ) : (
          <JoinCodeSection
            roomCode={roomCode}
            setRoomCode={setRoomCode}
            onSubmit={handleRoomCodeConnect}
            isConnecting={isConnecting}
          />
        )}
        
        {showTroubleshooting && <LanTroubleshootingCard />}
      </View>

      <MultiplayerHelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default JoinScreen;
