import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
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
import { logPermissionDebug, warnPermissionDebug } from "@/utils/permissionDebug";
import { setLocalSessionIdentity } from "@/redux/reducers/sessionSlice";
import { AppDispatch, RootState } from "@/redux/store";

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
      return "Trying to reach the host. Stay on the same Wi-Fi or hotspot.";
    }

    if (session.connectionStatus === "CONNECTED") {
      return "Connected. Finalizing your seat in the lobby.";
    }

    return "Scan the host QR or enter the room code exactly as shown.";
  }, [session.connectionStatus, session.errorMessage]);

  const handleConnectToIp = useCallback(
    async (hostIp: string) => {
      logPermissionDebug("JoinScreen", "Attempting connect to host", {
        hostIp,
        canAttemptJoin,
        connectionStatus: session.connectionStatus,
        networkStatus,
      });

      if (!canAttemptJoin) {
        warnPermissionDebug("JoinScreen", "Connect blocked because same-network gate is not satisfied", {
          hostIp,
          networkStatus,
          networkStep,
          networkErrorMessage,
        });
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <View className="absolute inset-0">
        <Image
          source={require("@/assets/images/bg/image.png")}
          className="h-full w-full"
          resizeMode="cover"
        />
        <BlurView intensity={20} tint="dark" className="absolute inset-0" />
        <LinearGradient
          colors={["rgba(0,0,0,0.82)", "rgba(0,0,0,0.42)", "transparent"]}
          className="absolute inset-0"
        />
      </View>

      <LobbyHeader onBack={handleBack} />

      <View className="flex-1 px-6 pb-8">
        <View className="mb-6 overflow-hidden rounded-[34px]">
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.08)",
              "rgba(255,255,255,0.03)",
              "rgba(0,0,0,0.18)",
            ]}
            className="rounded-[34px] border border-white/10 p-6"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[10px] uppercase tracking-[3px] text-blue-300">
                Join LAN Room
              </Text>
              <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Text className="text-[10px] font-main-bold uppercase tracking-[2px] text-white/65">
                  Same Wi-Fi
                </Text>
              </View>
            </View>

            <Text className="mt-3 font-main-bold text-3xl text-white">
              Join your friend smoothly
            </Text>
            <Text className="mt-3 text-sm leading-5 text-white/60">
              Joining as {userName}. Your seat will automatically replace the
              first open bot slot.
            </Text>

            <View className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <Text className="text-[10px] uppercase tracking-[2px] text-white/35">
                Connection Status
              </Text>
              <Text className="mt-2 font-main-bold text-white">
                {isConnecting
                  ? "Connecting to host..."
                  : session.connectionStatus === "CONNECTED"
                    ? "Connected"
                    : "Ready to join"}
              </Text>
              <Text className="mt-2 text-sm leading-5 text-white/60">
                {connectionCopy}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {canAttemptJoin ? (
          <>
            <View className="mb-4 flex-row rounded-2xl border border-white/10 bg-white/5 p-1">
              {[
                { key: "scan", label: "Scan QR" },
                { key: "code", label: "Enter Code" },
              ].map((item) => {
                const selected = joinMethod === item.key;

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setJoinMethod(item.key as "scan" | "code")}
                    className="flex-1 overflow-hidden rounded-[14px]"
                  >
                    <LinearGradient
                      colors={
                        selected
                          ? ["rgba(37,99,235,0.45)", "rgba(29,78,216,0.28)"]
                          : ["transparent", "transparent"]
                      }
                      className="items-center rounded-[14px] px-4 py-3"
                    >
                      <Text
                        className={`font-main-bold uppercase tracking-[2px] ${
                          selected ? "text-white" : "text-white/45"
                        }`}
                      >
                        {item.label}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>

            {joinMethod === "scan" ? (
              <View className="overflow-hidden rounded-[30px]">
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                  className="rounded-[30px] border border-white/10 p-5"
                >
                  <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
                    Scan Host QR
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-white/60">
                    Keep the host QR inside the frame. We will connect as soon
                    as it is detected.
                  </Text>

                  <View className="mt-4">
                    <QRScanner
                      key={`${session.connectionStatus}-${session.errorMessage || "idle"}`}
                      onScan={(payload) => {
                        logPermissionDebug("JoinScreen", "QR scanner returned payload", payload);
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
                        void handleConnectToIp(payload.ip);
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
                    Enter Room Code
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-white/60">
                    Ask the host for the code shown above the QR card.
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
                      className="items-center rounded-2xl px-4 py-4"
                    >
                      <Text
                        className={`font-main-bold tracking-[2px] ${
                          isConnecting ? "text-white/45" : "text-white"
                        }`}
                      >
                        {isConnecting ? "CONNECTING..." : "CONNECT TO HOST"}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </LinearGradient>
              </View>
            )}
          </>
        ) : (
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
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default JoinScreen;
