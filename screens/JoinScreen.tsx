import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import {
  HandshakeStatus,
  HandshakeStatusType,
} from "@/components/Lobby/HandshakeStatus";
import { LobbyBackdrop } from "@/components/Lobby/LobbyBackdrop";
import { LobbyHeader } from "@/components/Lobby/LobbyHeader";
import { QRScanner } from "@/components/QRScanner";
import { Text } from "@/components/Text";
import { toast } from "@/components/feedback/toast";
import { useNetworkPermissions } from "@/hooks/useNetworkPermissions";
import {
  decodeLanRoomCode,
  joinLanLobby,
  leaveLanLobby,
} from "@/service/lanLobbyCoordinator";
import { setLocalSessionIdentity } from "@/redux/reducers/sessionSlice";
import { AppDispatch, RootState } from "@/redux/store";
import {
  logPermissionDebug,
  warnPermissionDebug,
} from "@/utils/permissionDebug";

const isValidIpv4 = (value: string) => {
  const parts = value.trim().split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => {
      const numeric = Number(part);
      return (
        part !== "" &&
        Number.isInteger(numeric) &&
        numeric >= 0 &&
        numeric <= 255
      );
    })
  );
};

const TogglePill = ({
  selected,
  label,
  onPress,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} className="flex-1 overflow-hidden rounded-[16px]">
    <LinearGradient
      colors={
        selected
          ? ["rgba(37,99,235,0.55)", "rgba(79,70,229,0.35)"]
          : ["transparent", "transparent"]
      }
      className="rounded-[16px] px-4 py-3"
    >
      <Text
        className={`text-center font-main-bold uppercase tracking-[2px] ${
          selected ? "text-white" : "text-white/45"
        }`}
      >
        {label}
      </Text>
    </LinearGradient>
  </Pressable>
);

const PermissionCard = ({
  message,
  primaryLabel,
  onPrimary,
}: {
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
}) => (
  <View className="overflow-hidden rounded-[30px]">
    <LinearGradient
      colors={["rgba(239,68,68,0.18)", "rgba(15,23,42,0.22)"]}
      className="rounded-[30px] border border-red-400/20 p-5"
    >
      <Text className="text-[10px] uppercase tracking-[3px] text-red-200">
        Permission Needed
      </Text>
      <Text className="mt-3 font-main-bold text-2xl text-white">
        Let Chor Police join the room
      </Text>
      <Text className="mt-2 text-sm leading-5 text-white/65">{message}</Text>
      <Text className="mt-2 text-sm leading-5 text-white/55">
        If you want to play with a friend, make sure you allow Chor Police this
        permission.
      </Text>

      <Pressable onPress={onPrimary} className="mt-5 overflow-hidden rounded-2xl">
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          className="rounded-2xl px-4 py-4"
        >
          <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
            {primaryLabel}
          </Text>
        </LinearGradient>
      </Pressable>
    </LinearGradient>
  </View>
);

const JoinScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const session = useSelector((state: RootState) => state.session);
  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );
  const {
    step: networkStep,
    status: networkStatus,
    retry: retryNetwork,
    errorMessage: networkErrorMessage,
    openSettings,
  } = useNetworkPermissions({
    enabled: true,
    requireWifiIpAddress: false,
    requireAndroidWifiPermissions: false,
  });

  const [roomCode, setRoomCode] = useState("");
  const [joinMethod, setJoinMethod] = useState<"scan" | "code">("scan");

  const gameType = String(params.gameType || "CHOR_POLICE");
  const localPlayerId = session.localPlayerId;
  const userName = session.localPlayerName;
  const avatarId = session.localAvatarId || 1;
  const canAttemptJoin = networkStatus === "granted";
  const isConnecting = session.connectionStatus === "CONNECTING";
  const uiStep = networkStep === "idle" ? "checking_wifi" : networkStep;
  const uiStatus =
    networkStatus === "pending"
      ? "loading"
      : (networkStatus as HandshakeStatusType);

  useEffect(() => {
    logPermissionDebug("JoinScreen", "Join permission state updated", {
      networkStep,
      networkStatus,
      canAttemptJoin,
      connectionStatus: session.connectionStatus,
      errorMessage: networkErrorMessage,
      joinMethod,
    });
  }, [
    canAttemptJoin,
    joinMethod,
    networkErrorMessage,
    networkStatus,
    networkStep,
    session.connectionStatus,
  ]);

  useEffect(() => {
    const preselectedAvatarId = selectedImages[0];
    if (
      preselectedAvatarId &&
      session.connectionStatus === "IDLE" &&
      preselectedAvatarId !== session.localAvatarId
    ) {
      dispatch(setLocalSessionIdentity({ avatarId: preselectedAvatarId }));
    }
  }, [
    dispatch,
    selectedImages,
    session.connectionStatus,
    session.localAvatarId,
  ]);

  const connectionCopy = useMemo(() => {
    if (session.errorMessage) {
      return session.errorMessage;
    }

    if (session.connectionStatus === "CONNECTING") {
      return "Keep both devices on the same Wi-Fi or hotspot while we connect.";
    }

    if (session.connectionStatus === "CONNECTED") {
      return "Connected. Taking you into the room now.";
    }

    return "Scan the host QR or type the room code exactly as shown.";
  }, [session.connectionStatus, session.errorMessage]);

  const handleConnectToIp = useCallback(
    async (hostIp: string, hostPort?: number) => {
      logPermissionDebug("JoinScreen", "Attempting connect to host", {
        hostIp,
        hostPort,
        canAttemptJoin,
        connectionStatus: session.connectionStatus,
        networkStatus,
      });

      if (!canAttemptJoin) {
        warnPermissionDebug(
          "JoinScreen",
          "Connect blocked because same-network gate is not satisfied",
          {
            hostIp,
            networkStatus,
            networkStep,
            networkErrorMessage,
          },
        );
        toast.error(
          "Same Network Required",
          "Connect both devices to the same Wi-Fi or hotspot first.",
        );
        return;
      }

      if (!isValidIpv4(hostIp)) {
        toast.error("Invalid IP", "Please use a valid local host IP.");
        return;
      }

      if (!localPlayerId) {
        toast.error("Profile Missing", "Could not resolve your player identity.");
        return;
      }

      await joinLanLobby({
        hostIp,
        hostPort,
        localPlayerId,
        name: userName,
        avatarId,
        gameType,
      });
    },
    [avatarId, canAttemptJoin, gameType, localPlayerId, userName],
  );

  useEffect(() => {
    if (
      session.connectionStatus === "CONNECTED" &&
      session.players.length === 4
    ) {
      router.replace({
        pathname: "/lobby",
        params: {
          gameType,
        },
      } as any);
    }
  }, [gameType, router, session.connectionStatus, session.players.length]);

  const handleRoomCodeConnect = useCallback(async () => {
    const decodedIp = decodeLanRoomCode(roomCode);

    if (!decodedIp) {
      toast.error("Invalid Code", "Enter the room code exactly as shown by host.");
      return;
    }

    await handleConnectToIp(decodedIp);
  }, [handleConnectToIp, roomCode]);

  const handleBack = useCallback(() => {
    void (async () => {
      await leaveLanLobby();
      router.back();
    })();
  }, [router]);

  const permissionPrimaryLabel = uiStatus === "denied" ? "Open Settings" : "Try Again";
  const permissionPrimaryAction = useCallback(() => {
    if (uiStatus === "denied") {
      void openSettings();
      return;
    }

    void retryNetwork();
  }, [openSettings, retryNetwork, uiStatus]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <LobbyBackdrop
        blurIntensity={20}
        gradientColors={[
          "rgba(0,0,0,0.82)",
          "rgba(0,0,0,0.42)",
          "transparent",
        ]}
      />

      <LobbyHeader onBack={handleBack} />

      <View className="flex-1 px-6 pb-8">
        <View className="mb-6">
          <Text className="text-[10px] uppercase tracking-[3px] text-blue-200">
            Join A Friend
          </Text>
          <Text className="mt-2 font-main-bold text-4xl text-white">
            Scan or type the code
          </Text>
          <Text className="mt-2 text-sm leading-5 text-white/60">
            You are joining as {userName}. After you enter the room, you can
            still change your picture and name before the game starts.
          </Text>
        </View>

        <View className="mb-5 overflow-hidden rounded-[30px]">
          <LinearGradient
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
            className="rounded-[30px] border border-white/10 p-5"
          >
            <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
              Easy Steps
            </Text>
            <Text className="mt-3 font-main-bold text-white">
              1. Stay on the same Wi-Fi or hotspot
            </Text>
            <Text className="mt-2 font-main-bold text-white">
              2. Scan the QR or type the room code
            </Text>
            <Text className="mt-2 font-main-bold text-white">
              3. Wait for the host to tap Let's Go
            </Text>
            <Text className="mt-3 text-sm leading-5 text-white/55">
              {connectionCopy}
            </Text>
          </LinearGradient>
        </View>

        {!canAttemptJoin ? (
          uiStatus === "loading" ? (
            <HandshakeStatus
              step={uiStep as any}
              status={uiStatus}
              discoveredCount={0}
              errorMessage={networkErrorMessage}
              wifiSSID="Secure LAN"
              onRetry={retryNetwork}
              onOpenSettings={openSettings}
              isHost={false}
            />
          ) : (
            <PermissionCard
              message={
                networkErrorMessage ||
                "Nearby Wi-Fi and location permission help Chor Police find your friend's room."
              }
              primaryLabel={permissionPrimaryLabel}
              onPrimary={permissionPrimaryAction}
            />
          )
        ) : (
          <>
            <View className="mb-4 flex-row rounded-2xl border border-white/10 bg-white/5 p-1">
              <TogglePill
                selected={joinMethod === "scan"}
                label="Scan QR"
                onPress={() => setJoinMethod("scan")}
              />
              <TogglePill
                selected={joinMethod === "code"}
                label="Type Code"
                onPress={() => setJoinMethod("code")}
              />
            </View>

            {joinMethod === "scan" ? (
              <View className="overflow-hidden rounded-[30px]">
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                  className="rounded-[30px] border border-white/10 p-5"
                >
                  <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
                    Scan The Host QR
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-white/60">
                    Hold the host QR inside the frame. We connect as soon as we
                    read it.
                  </Text>

                  <View className="mt-4">
                    <QRScanner
                      key={`${session.connectionStatus}-${session.errorMessage || "idle"}`}
                      onScan={(payload) => {
                        logPermissionDebug(
                          "JoinScreen",
                          "QR scanner returned payload",
                          payload,
                        );
                        if (!payload.ip) {
                          warnPermissionDebug(
                            "JoinScreen",
                            "QR scanner payload missing IP",
                            payload,
                          );
                          toast.error(
                            "Invalid QR",
                            "This QR code does not contain a room IP.",
                          );
                          return;
                        }
                        void handleConnectToIp(payload.ip, payload.port);
                      }}
                    />
                  </View>
                </LinearGradient>
              </View>
            ) : (
              <View className="overflow-hidden rounded-[30px]">
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                  className="rounded-[30px] border border-white/10 p-5"
                >
                  <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
                    Type The Room Code
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-white/60">
                    Ask the host for the code shown next to the QR.
                  </Text>
                  <TextInput
                    value={roomCode}
                    onChangeText={setRoomCode}
                    autoCapitalize="characters"
                    editable={!isConnecting}
                    placeholder="C0A8-010A"
                    placeholderTextColor="rgba(255,255,255,0.18)"
                    className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 font-main-bold text-lg text-white"
                  />

                  <Pressable
                    disabled={isConnecting}
                    onPress={() => {
                      void handleRoomCodeConnect();
                    }}
                    className="mt-4 overflow-hidden rounded-2xl"
                  >
                    <LinearGradient
                      colors={
                        isConnecting
                          ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"]
                          : ["#2563EB", "#1D4ED8"]
                      }
                      className="rounded-2xl px-4 py-4"
                    >
                      <Text
                        className={`text-center font-main-bold uppercase tracking-[2px] ${
                          isConnecting ? "text-white/45" : "text-white"
                        }`}
                      >
                        {isConnecting ? "CONNECTING..." : "JOIN ROOM"}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </LinearGradient>
              </View>
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default JoinScreen;
