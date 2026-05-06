import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { BlurView } from "expo-blur";
import { router } from "expo-router";

import { Text } from "@/components/Text";
import { hp, rf, wp } from "@/utils/responsive";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  crashId: string;
}

const createCrashId = () => {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `CP-${time}-${random}`;
};

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    crashId: createCrashId(),
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      crashId: createCrashId(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 [GlobalErrorBoundary] CRASH DETECTED:", {
      crashId: this.state.crashId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      crashId: createCrashId(),
    });

    requestAnimationFrame(() => {
      router.dismissAll();
      router.replace("/mode-select" as any);
    });
  };

  private handleCopyError = async () => {
    try {
      const errorMessage = [
        `Help Code: ${this.state.crashId}`,
        `Error: ${this.state.error?.message ?? "Unknown error"}`,
        `Stack: ${this.state.error?.stack ?? "No stack available"}`,
      ].join("\n\n");

      await Clipboard.setStringAsync(errorMessage);

      Alert.alert(
        "Copied",
        "Help code copied. Send it when reporting the problem.",
      );
    } catch {
      Alert.alert("Copy Failed", "Could not copy the help code.");
    }
  };

  private handleReport = () => {
    const crashId = this.state.crashId;

    this.setState({
      hasError: false,
      error: null,
      crashId: createCrashId(),
    });

    requestAnimationFrame(() => {
      router.push({
        pathname: "/report-bug" as any,
        params: { crashId },
      });
    });
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#020617", "#050508", "#111827", "#050508"]}
          locations={[0, 0.38, 0.72, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
        <View style={styles.redGlow} />

        <MotiView
          from={{ opacity: 0, scale: 0.94, translateY: 24 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{
            type: "spring",
            damping: 17,
            stiffness: 130,
          }}
          style={styles.cardWrapper}
        >
          <BlurView
            intensity={Platform.OS === "ios" ? 35 : 25}
            tint="dark"
            style={styles.card}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.10)",
                "rgba(255,255,255,0.035)",
                "rgba(99,102,241,0.08)",
              ]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.iconOuter}>
              <LinearGradient
                colors={["rgba(248,113,113,0.25)", "rgba(99,102,241,0.12)"]}
                style={styles.iconInner}
              >
                <MaterialCommunityIcons
                  name="shield-alert-outline"
                  size={rf(5.4)}
                  color="#FCA5A5"
                />
              </LinearGradient>
            </View>

            <Text style={styles.kicker}>Game Helper</Text>

            <Text style={styles.title}>Oops!</Text>

            <Text style={styles.subtitle}>
              The game had a small problem. Don’t worry, you can go back and
              play again.
            </Text>

            <View style={styles.crashBox}>
              <View style={styles.crashTextBox}>
                <Text style={styles.crashLabel}>Help Code</Text>
                <Text style={styles.crashId} numberOfLines={1}>
                  {this.state.crashId}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={this.handleCopyError}
                style={styles.copyMiniButton}
              >
                <MaterialCommunityIcons
                  name="content-copy"
                  size={rf(1.8)}
                  color="#CBD5E1"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={this.handleReset}
              activeOpacity={0.86}
              style={styles.primaryButton}
            >
              <LinearGradient
                colors={["#818CF8", "#6366F1", "#4F46E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryGradient}
              >
                <MaterialCommunityIcons
                  name="gamepad-variant-outline"
                  size={rf(2.4)}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryText}>Play Again</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryRow}>
              <TouchableOpacity
                onPress={this.handleCopyError}
                activeOpacity={0.82}
                style={styles.secondaryButton}
              >
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={rf(2.1)}
                  color="#CBD5E1"
                />

                <Text style={styles.secondaryText}>Copy Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.handleReport}
                activeOpacity={0.82}
                style={styles.reportButton}
              >
                <MaterialCommunityIcons
                  name="bug-outline"
                  size={rf(2.1)}
                  color="#FCA5A5"
                />

                <Text style={styles.reportText}>Tell Us</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>
              We’ll try to keep your game safe.
            </Text>
          </BlurView>
        </MotiView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050508",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(5),
  },

  topGlow: {
    position: "absolute",
    top: -hp(10),
    right: -wp(22),
    width: wp(78),
    height: wp(78),
    borderRadius: wp(39),
    backgroundColor: "rgba(99,102,241,0.20)",
  },

  bottomGlow: {
    position: "absolute",
    bottom: -hp(12),
    left: -wp(24),
    width: wp(82),
    height: wp(82),
    borderRadius: wp(41),
    backgroundColor: "rgba(79,70,229,0.15)",
  },

  redGlow: {
    position: "absolute",
    top: hp(18),
    left: -wp(20),
    width: wp(55),
    height: wp(55),
    borderRadius: wp(27.5),
    backgroundColor: "rgba(239,68,68,0.11)",
  },

  cardWrapper: {
    width: "100%",
    maxWidth: 430,
    borderRadius: rf(4),
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.32,
    shadowRadius: 30,
    elevation: 18,
  },

  card: {
    overflow: "hidden",
    borderRadius: rf(4),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.76)",
  },

  iconOuter: {
    width: rf(11),
    height: rf(11),
    borderRadius: rf(5.5),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.28)",
    marginBottom: hp(2),
  },

  iconInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  kicker: {
    fontFamily: "font-main-bold",
    fontSize: rf(1.15),
    color: "#A5B4FC",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: hp(1),
  },

  title: {
    fontFamily: "font-main-bold",
    fontSize: rf(3.9),
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: hp(1.1),
  },

  subtitle: {
    fontFamily: "font-main-medium",
    fontSize: rf(1.6),
    color: "rgba(226,232,240,0.74)",
    textAlign: "center",
    lineHeight: rf(2.5),
    marginBottom: hp(2.4),
  },

  crashBox: {
    width: "100%",
    minHeight: hp(6.6),
    borderRadius: rf(2.4),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.055)",
    paddingHorizontal: wp(4),
    marginBottom: hp(2.2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  crashTextBox: {
    flex: 1,
    paddingRight: wp(3),
  },

  crashLabel: {
    fontFamily: "font-main-bold",
    fontSize: rf(1.05),
    color: "rgba(255,255,255,0.38)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 3,
  },

  crashId: {
    fontFamily: "font-main-bold",
    fontSize: rf(1.35),
    color: "#E0E7FF",
  },

  copyMiniButton: {
    width: rf(4.6),
    height: rf(4.6),
    borderRadius: rf(2.3),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  primaryButton: {
    width: "100%",
    borderRadius: rf(2.5),
    overflow: "hidden",
    marginBottom: hp(1.4),
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 10,
  },

  primaryGradient: {
    minHeight: hp(6.4),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  primaryText: {
    marginLeft: 10,
    fontFamily: "font-main-bold",
    fontSize: rf(1.55),
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 2,
  },

  secondaryRow: {
    width: "100%",
    flexDirection: "row",
  },

  secondaryButton: {
    flex: 1,
    minHeight: hp(5.7),
    borderRadius: rf(2.2),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.055)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginRight: 6,
  },

  reportButton: {
    flex: 1,
    minHeight: hp(5.7),
    borderRadius: rf(2.2),
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.24)",
    backgroundColor: "rgba(239,68,68,0.10)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginLeft: 6,
  },

  secondaryText: {
    marginLeft: 8,
    fontFamily: "font-main-bold",
    fontSize: rf(1.16),
    color: "#CBD5E1",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  reportText: {
    marginLeft: 8,
    fontFamily: "font-main-bold",
    fontSize: rf(1.16),
    color: "#FCA5A5",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  footerText: {
    marginTop: hp(1.8),
    fontFamily: "font-main-medium",
    fontSize: rf(1.08),
    color: "rgba(255,255,255,0.36)",
    textAlign: "center",
  },
});
