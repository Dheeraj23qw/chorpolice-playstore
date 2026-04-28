import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

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
import { PermissionCard } from "@/components/JoinScreen/PermissionCard";
import { JoinMethodToggle } from "@/components/JoinScreen/JoinMethodToggle";
import { JoinQRSection } from "@/components/JoinScreen/JoinQRSection";
import { JoinCodeSection } from "@/components/JoinScreen/JoinCodeSection";
import { MultiplayerHelpModal } from "@/modal/MultiplayerHelpModal";

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

  const { step, status, retry, errorMessage, openSettings } =
    useNetworkPermissions({
      enabled: true,
      requireWifiIpAddress: false,
      requireAndroidWifiPermissions: false,
    });

  const [roomCode, setRoomCode] = useState("");
  const [joinMethod, setJoinMethod] = useState<"scan" | "code">("scan");
  const [showHelp, setShowHelp] = useState(false);

  const gameType = String(params.gameType || "CHOR_POLICE");

  const canAttemptJoin = status === "granted";
  const isConnecting = session.connectionStatus === "CONNECTING";

  const userName = session.localPlayerName;

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

  /* ---------------- CONNECT ---------------- */
  const handleConnectToIp = useCallback(
    async (ip: string, port?: number) => {
      if (!canAttemptJoin) {
        toast.error(
          "Same Network Required",
          "Connect both devices to same Wi-Fi",
        );
        return;
      }

      if (!isValidIpv4(ip)) {
        toast.error("Invalid IP");
        return;
      }

      if (!session.localPlayerId) {
        toast.error("Profile Missing");
        return;
      }

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
    [canAttemptJoin, session],
  );

  /* ---------------- AUTO NAV ---------------- */
  useEffect(() => {
    if (
      session.connectionStatus === "CONNECTED" &&
      session.players.length === 4
    ) {
      router.replace({
        pathname: "/lobby",
        params: { gameType },
      } as any);
    }
  }, [session.connectionStatus, session.players.length]);

  /* ---------------- ROOM CODE ---------------- */
  const handleRoomCodeConnect = useCallback(async () => {
    const decodedIp = decodeLanRoomCode(roomCode);

    if (!decodedIp) {
      toast.error("Invalid Code", "Enter correct room code");
      return;
    }

    await handleConnectToIp(decodedIp);
  }, [roomCode, handleConnectToIp]);

  /* ---------------- COPY TEXT ---------------- */
  const connectionCopy = useMemo(() => {
    if (session.errorMessage) return session.errorMessage;
    if (isConnecting) return "Keep devices on same Wi-Fi while connecting.";
    if (session.connectionStatus === "CONNECTED")
      return "Connected. Entering room...";
    return "Scan QR or enter room code.";
  }, [session, isConnecting]);

  /* ---------------- PERMISSION ACTION ---------------- */
  const permissionPrimaryLabel =
    status === "denied" ? "Open Settings" : "Try Again";

  const permissionPrimaryAction = useCallback(() => {
    if (status === "denied") {
      openSettings();
      return;
    }
    retry();
  }, [status]);

  /* ---------------- UI ---------------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <LobbyBackdrop />
      <LobbyHeader
        // Handle Leaving Logic
        onBack={async () => {
          await leaveLanLobby();
          router.back();
        }}
        // Bug Reporting (The "isDanger" icon)
        onReportPress={() => router.push("/report-bug")}
        // Help Documentation
        rightIcon="help-buoy-outline"
        onRightPress={() => setShowHelp(true)}
      />

      <View className="flex-1 px-6 pb-8">
        {/* HEADER */}
        <JoinHeaderBlock />

        {/* STEPS */}
        <JoinStepsCard />

        {/* CONTENT AREA */}
        <JoinMethodToggle
          joinMethod={joinMethod}
          setJoinMethod={setJoinMethod}
        />

        {joinMethod === "scan" ? (
          !canAttemptJoin ? (
            <PermissionCard
              message={errorMessage || "Camera permission is required to scan QR codes."}
              primaryLabel={permissionPrimaryLabel}
              onPrimary={permissionPrimaryAction}
            />
          ) : (
            <JoinQRSection
              session={session}
              onScan={(payload: any) => {
                if (!payload.ip) return;
                handleConnectToIp(payload.ip, payload.port);
              }}
            />
          )
        ) : (
          <JoinCodeSection
            roomCode={roomCode}
            setRoomCode={setRoomCode}
            onSubmit={handleRoomCodeConnect}
            isConnecting={isConnecting}
          />
        )}
      </View>

      <MultiplayerHelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default JoinScreen;
