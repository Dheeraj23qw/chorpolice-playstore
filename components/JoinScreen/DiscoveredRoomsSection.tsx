import React from "react";
import { View, Pressable } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { DiscoveryResult } from "@/service/network/LanDiscoveryStrategy";
import { rf } from "@/utils/responsive";

interface Props {
  rooms: DiscoveryResult[];
  isSearching: boolean;
  joiningIp: string | null;
  onJoin: (room: DiscoveryResult) => void;
}

export const DiscoveredRoomsSection = ({ rooms, isSearching, joiningIp, onJoin }: Props) => {
  return (
    <View style={{ marginBottom: 20 }}>

      {/* ── Section header ── */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 }}>
        {/* Pulse dot — green when rooms found, dimmed when scanning */}
        <MotiView
          from={{ opacity: 0.3, scale: 0.7 }}
          animate={{ opacity: rooms.length > 0 ? 1 : 0.45, scale: rooms.length > 0 ? 1.1 : 0.9 }}
          transition={{ loop: isSearching && rooms.length === 0, type: "timing", duration: 900, repeatReverse: true }}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: rooms.length > 0 ? "#22c55e" : "rgba(255,255,255,0.3)",
          }}
        />
        <Text
          style={{ fontSize: rf(1.3), color: "rgba(255,255,255,0.35)", letterSpacing: 2.5 }}
          className="font-main-bold uppercase"
        >
          {rooms.length > 0 ? `${rooms.length} room${rooms.length > 1 ? "s" : ""} nearby` : "Searching nearby…"}
        </Text>
      </View>

      {/* ── Room cards ── */}
      <AnimatePresence>
        {rooms.map((room) => {
          const isJoining = joiningIp === room.ip;
          return (
            <MotiView
              key={room.lobbyId || room.ip}
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: "timing", duration: 250 }}
              style={{ marginBottom: 10 }}
            >
              <View
                style={{
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: isJoining ? "rgba(99,102,241,0.5)" : "rgba(168,85,247,0.25)",
                  backgroundColor: isJoining
                    ? "rgba(99,102,241,0.12)"
                    : "rgba(168,85,247,0.08)",
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Icon */}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: "rgba(168,85,247,0.18)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="game-controller" size={rf(2.1)} color="#A855F7" />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: rf(1.65), color: "#fff" }}
                    className="font-main-bold"
                  >
                    {room.hostName || "Friend's Room"}
                  </Text>
                  <Text
                    style={{ fontSize: rf(1.2), color: "rgba(255,255,255,0.35)", marginTop: 2, letterSpacing: 1.5 }}
                    className="font-main-md uppercase"
                  >
                    Code: {room.roomCode}
                  </Text>
                </View>

                {/* Join button */}
                <Pressable
                  onPress={() => onJoin(room)}
                  disabled={joiningIp !== null}
                  style={{
                    backgroundColor: isJoining ? "rgba(99,102,241,0.9)" : "#A855F7",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    opacity: joiningIp && !isJoining ? 0.45 : 1,
                  }}
                >
                  {isJoining && (
                    <MotiView
                      from={{ rotate: "0deg" }}
                      animate={{ rotate: "360deg" }}
                      transition={{ loop: true, duration: 900, type: "timing" }}
                    >
                      <Ionicons name="sync-outline" size={14} color="#fff" />
                    </MotiView>
                  )}
                  <Text
                    style={{ fontSize: rf(1.4), color: "#fff", letterSpacing: 1 }}
                    className="font-main-bold uppercase"
                  >
                    {isJoining ? "Joining" : "Join"}
                  </Text>
                </Pressable>
              </View>
            </MotiView>
          );
        })}
      </AnimatePresence>
    </View>
  );
};
