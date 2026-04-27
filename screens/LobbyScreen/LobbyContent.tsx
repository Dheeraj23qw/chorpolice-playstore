import React, { useMemo } from "react";
import { View } from "react-native";

import {
  HostInviteCard,
  HostStartErrorCard,
  HandshakeStatus,
  PermissionFallbackCard,
  PlayersList,
} from "@/components/LobbyScreen";

import { playerImages } from "@/constants/playerData";
import { PermissionStep } from "@/hooks/useNetworkPermissions";
import { LobbyState } from "@/components/LobbyScreen/types"; // 👈 IMPORTANT
import { AnimatePresence } from "moti";

interface Props {
  lobby: LobbyState; // ✅ KEEP ORIGINAL TYPE
  requireLanReady: boolean;
  status: string;
  step: PermissionStep;
  errorMessage: string | null;
  retry: () => void;
  openSettings: () => void;
  copyRoomCode: () => void;
}

export const LobbyContent: React.FC<Props> = ({
  lobby,
  requireLanReady,
  status,
  step,
  errorMessage,
  retry,
  openSettings,
  copyRoomCode,
}) => {
  const [isPlayersListOpen, setIsPlayersListOpen] = React.useState(!lobby.isHost);

  /* ---------------- DERIVED UI STATE ---------------- */
  const ui = useMemo(() => {
    const permissionBlocked =
      requireLanReady &&
      status !== "granted" &&
      !lobby.isLocalOnlyLobby &&
      lobby.connectionStatus !== "HOSTING";

    const permissionPending = status === "pending";

    const hostError =
      lobby.isHost &&
      lobby.connectionStatus === "ERROR" &&
      !!lobby.errorMessage;

    return {
      permissionBlocked,
      permissionPending,
      hostError,
    };
  }, [requireLanReady, status, lobby]);

  /* ---------------- PERMISSION BLOCK ---------------- */
  if (ui.permissionBlocked) {
    return ui.permissionPending ? (
      <HandshakeStatus
        step={step === "idle" ? "checking_wifi" : step}
        status="loading"
        discoveredCount={0}
        errorMessage={errorMessage}
        isHost={lobby.isHost}
        onRetry={retry}
        onOpenSettings={openSettings}
        wifiSSID="Secure LAN"
      />
    ) : (
      <PermissionFallbackCard
        isHost={lobby.isHost}
        onPrimary={status === "denied" ? openSettings : retry}
        onSecondary={
          lobby.isHost ? lobby.handleContinueWithReadySeats : undefined
        }
        primaryLabel={status === "denied" ? "Open Settings" : "Try Again"}
        message={
          errorMessage ||
          "Nearby Wi-Fi and location permission help find local rooms."
        }
      />
    );
  }

  /* ---------------- HOST ERROR ---------------- */
  if (ui.hostError) {
    return (
      <HostStartErrorCard
        message={lobby.errorMessage!}
        onRetry={lobby.handleRetryHosting}
        retrying={lobby.isBootstrappingHost}
        onUseReadySeats={lobby.handleContinueWithReadySeats}
      />
    );
  }

  /* ---------------- MAIN CONTENT ---------------- */
  return (
    <View>
      <AnimatePresence>
        {lobby.isHost && !isPlayersListOpen && (
          <HostInviteCard lobby={lobby} onCopyRoomCode={copyRoomCode} />
        )}
      </AnimatePresence>

      <PlayersList
        lobby={lobby} // ✅ FULL TYPE SAFE NOW
        getAvatarSource={(id: number) =>
          playerImages[id]?.src ||
          require("@/assets/images/chorsipahi/kid1.webp")
        }
        onOpenChange={setIsPlayersListOpen}
      />
    </View>
  );
};
