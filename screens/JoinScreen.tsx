import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { LobbyBackdrop } from "@/components/LobbyScreen/LobbyBackdrop";
import { LobbyHeader } from "@/components/LobbyScreen/LobbyHeader";
import { toast } from "@/components/feedback/toast";
import { useNetworkPermissions } from "@/hooks/useNetworkPermissions";
import {
  getCandidateIpsForRoomCode,
  joinLanLobby,
  leaveLanLobby,
} from "@/service/lanLobbyCoordinator";
import { NETWORK } from "@/constants/Networking";
import { getGatewayIpAddress } from "@/utils/NetworkUtils";
import { setLocalSessionIdentity } from "@/redux/reducers/sessionSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { JoinQRSection } from "@/components/JoinScreen/JoinQRSection";
import { JoinCodeSection } from "@/components/JoinScreen/JoinCodeSection";
import { DiscoveredRoomsSection } from "@/components/JoinScreen/DiscoveredRoomsSection";
import { MultiplayerHelpModal } from "@/modal/MultiplayerHelpModal";
import { useLanDiscovery } from "@/hooks/useLanDiscovery";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { LanDebugPanel } from "@/components/LobbyScreen/LanDebugPanel";
import { FloatingDebugToggle } from "@/components/LobbyScreen/FloatingDebugToggle";

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

/* ─────────────────── PILL TOGGLE ─────────────────── */
const MethodToggle = ({
  method,
  onChange,
}: {
  method: "scan" | "code";
  onChange: (m: "scan" | "code") => void;
}) => (
  <View
    style={{
      flexDirection: "row",
      backgroundColor: "rgba(255,255,255,0.06)",
      borderRadius: 20,
      padding: 4,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    }}
  >
    {(["scan", "code"] as const).map((m) => {
      const active = method === m;
      return (
        <Pressable
          key={m}
          onPress={() => onChange(m)}
          style={{ flex: 1 }}
        >
          <MotiView
            animate={{
              backgroundColor: active
                ? "rgba(99,102,241,0.9)"
                : "transparent",
            }}
            transition={{ type: "timing", duration: 200 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              borderRadius: 16,
              gap: 6,
            }}
          >
            <Ionicons
              name={m === "scan" ? "qr-code-outline" : "keypad-outline"}
              size={rf(1.8)}
              color={active ? "#fff" : "rgba(255,255,255,0.4)"}
            />
            <Text
              style={{
                fontSize: rf(1.5),
                color: active ? "#fff" : "rgba(255,255,255,0.4)",
                fontWeight: active ? "700" : "400",
                letterSpacing: 0.5,
              }}
            >
              {m === "scan" ? "Scan QR" : "Room Code"}
            </Text>
          </MotiView>
        </Pressable>
      );
    })}
  </View>
);

/* ─────────────────── MAIN ─────────────────── */
const JoinScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const session = useSelector((state: RootState) => state.session);
  const selectedImages = useSelector((state: RootState) => state.player.selectedImages);
  const userCoins = useSelector((state: RootState) => state.wallet.coins);

  const [isLanModeRequested, setIsLanModeRequested] = useState(false);

  const { status, retry, errorMessage, openSettings, networkContext } =
    useNetworkPermissions({
      enabled: isLanModeRequested,
      requireWifiIpAddress: false,
      requireAndroidWifiPermissions: false,
    });

  const [roomCode, setRoomCode] = useState("");
  const [joinMethod, setJoinMethod] = useState<"scan" | "code">("scan");
  const [showHelp, setShowHelp] = useState(false);

  const { discoveredRooms, isSearching } = useLanDiscovery(true);

  const gameType = String(params.gameType || "CHOR_POLICE");

  const isConnecting = session.connectionStatus === "CONNECTING";
  const [isSmartJoining, setIsSmartJoining] = useState(false);
  const [joiningRoomIp, setJoiningRoomIp] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  /* ── Avatar init ── */
  useEffect(() => {
    const avatar = selectedImages[0];
    if (avatar && session.connectionStatus === "IDLE" && avatar !== session.localAvatarId) {
      dispatch(setLocalSessionIdentity({ avatarId: avatar }));
    }
  }, [selectedImages, session.connectionStatus]);

  /* ── Status toasts ── */
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prev === status) return;
    if (status === "no_wifi" && networkContext === "none") {
      toast.error("No Network", "Connect to the host's WiFi or Hotspot.");
    } else if (status === "denied") {
      toast.error("Permission Needed", "Grant Location permission to find local games.");
    } else if (status === "granted" && (prev === "no_wifi" || prev === "denied" || prev === "error")) {
      toast.success("Ready! ✓", "You can now join your friends.");
    }
  }, [status, networkContext]);

  /* ── Session error toasts ── */
  useEffect(() => {
    if (session.connectionStatus === "ERROR" && session.errorMessage) {
      toast.error("Connection Failed", session.errorMessage);
    }
  }, [session.connectionStatus, session.errorMessage]);

  /* ── Connect ── */
  const handleConnectToIp = useCallback(
    async (
      ip: string,
      port?: number,
      candidateIps: string[] = [],
      targetRoomCode: string | null = null,
    ) => {
      if (isSmartJoining) return;
      if (!isLanModeRequested) setIsLanModeRequested(true);

      if (status === "no_wifi" && networkContext === "none") {
        toast.error("No Network", "Make sure everyone is on the same hotspot or WiFi.");
        return;
      }
      if (!isValidIpv4(ip)) {
        toast.error("Invalid Code", "Couldn't decode a valid address.");
        return;
      }
      if (!session.localPlayerId) {
        toast.error("Profile Missing", "Please restart the app.");
        return;
      }

      toast.info("Connecting...", "Joining your friend's room.");
      setIsSmartJoining(true);
      setJoiningRoomIp(ip);

      try {
        await joinLanLobby({
          hostIp: ip,
          hostPort: port,
          candidateIps,
          roomCode: targetRoomCode,
          localPlayerId: session.localPlayerId,
          name: session.localPlayerName,
          avatarId: session.localAvatarId,
          coins: userCoins,
          gameType,
        });
      } finally {
        setIsSmartJoining(false);
        setJoiningRoomIp(null);
      }
    },
    [status, networkContext, session, userCoins, gameType, isLanModeRequested],
  );

  /* ── Auto-nav on connected ── */
  useEffect(() => {
    if (session.connectionStatus === "CONNECTED" || session.connectionStatus === "CONNECTING") {
      if (session.connectionStatus === "CONNECTED") {
        toast.success("Connected! 🎉", "You joined the lobby.");
      }
      router.replace({ pathname: "/lobby", params: { gameType } } as any);
    }
  }, [session.connectionStatus]);

  /* ── Room code connect ── */
  const handleRoomCodeConnect = useCallback(async () => {
    if (!roomCode || roomCode.length < 3) {
      toast.error("Invalid Code", "Enter the 3-digit code on the host's screen.");
      return;
    }
    const gateway = await getGatewayIpAddress();
    console.log(`[JoinScreen] Manual Join: code=${roomCode}, local=${session.localIp}, gateway=${gateway}`);
    
    const candidates = getCandidateIpsForRoomCode(roomCode, session.localIp, gateway);
    console.log(`[JoinScreen] Candidates generated:`, candidates);

    if (candidates.length === 0) {
      toast.error("Invalid Code", "Please enter a valid 3-digit room code.");
      return;
    }
    await handleConnectToIp(candidates[0], NETWORK.TCP_SERVER_PORT, candidates, roomCode);
  }, [roomCode, handleConnectToIp, session.localIp]);

  /* ─────────────────── UI ─────────────────── */
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={20}
      style={{ flex: 1, backgroundColor: "#050508" }}
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
            Find a nearby game or scan the host&apos;s QR
          </Text>
        </View>

        {/* ── Network error banner (only when active + broken) ── */}
        <AnimatePresence>
          {isLanModeRequested && status !== "granted" && status !== "pending" && (
            <MotiView
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -6 }}
              transition={{ type: "timing", duration: 250 }}
              style={{
                marginBottom: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(239,68,68,0.3)",
                backgroundColor: "rgba(239,68,68,0.08)",
                padding: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="alert-circle-outline" size={rf(2)} color="#ef4444" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: rf(1.55), color: "#ef4444" }} className="font-main-bold">
                    {status === "no_wifi" ? "No connection found" : "Permission needed"}
                  </Text>
                  <Text style={{ fontSize: rf(1.35), color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                    {errorMessage || "Connect to the same WiFi or hotspot as the host."}
                  </Text>
                </View>
                <Pressable
                  onPress={() => status === "denied" ? openSettings() : retry()}
                  style={{
                    backgroundColor: "rgba(239,68,68,0.15)",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                  }}
                >
                  <Text style={{ fontSize: rf(1.3), color: "#ef4444" }} className="font-main-bold">
                    {status === "denied" ? "Settings" : "Retry"}
                  </Text>
                </Pressable>
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        {/* ── Discovered Rooms (UDP) ── */}
        <DiscoveredRoomsSection
          rooms={discoveredRooms}
          isSearching={isSearching}
          joiningIp={joiningRoomIp}
          onJoin={(room) => {
            handleConnectToIp(room.ip, room.port, [], room.roomCode || null);
          }}
        />

        {/* ── Method Toggle ── */}
        <View style={{ marginBottom: 16 }}>
          <MethodToggle method={joinMethod} onChange={setJoinMethod} />
        </View>

        {/* ── Content Panel ── */}
        <AnimatePresence exitBeforeEnter>
          {joinMethod === "scan" ? (
            <MotiView
              key="scan"
              from={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: "timing", duration: 220 }}
            >
              <JoinQRSection
                session={session}
                onScan={(payload: any) => {
                  if (!payload.ip) return;
                  handleConnectToIp(
                    payload.ip,
                    payload.port,
                    payload.candidateIps,
                    payload.roomCode,
                  );
                }}
              />
            </MotiView>
          ) : (
            <MotiView
              key="code"
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 8 }}
              transition={{ type: "timing", duration: 220 }}
            >
              <JoinCodeSection
                roomCode={roomCode}
                setRoomCode={setRoomCode}
                onSubmit={handleRoomCodeConnect}
                isConnecting={isConnecting || isSmartJoining}
              />
            </MotiView>
          )}
        </AnimatePresence>
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

      <MultiplayerHelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
    </KeyboardAvoidingView>
  );
};

export default JoinScreen;
