import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, AnimatePresence } from "moti";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Text } from "@/components/Text";
import { router } from "expo-router";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 [GlobalErrorBoundary] CRASH DETECTED:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    router.dismissAll();
    router.replace("/");
  };

  private handleCopyError = async () => {
    const errorMessage = `Error: ${this.state.error?.message}\nStack: ${this.state.error?.stack}`;
    await Clipboard.setStringAsync(errorMessage);
    Alert.alert("Error Copied", "The technical details have been copied to your clipboard. Please paste them in your bug report.");
  };

  private handleReport = () => {
    // Navigate to bug report or open mail
    router.push("/report-bug");
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={["#050508", "#1a1a2e", "#050508"]}
            style={StyleSheet.absoluteFill}
          />

          <AnimatePresence>
            <MotiView
              from={{ opacity: 0, scale: 0.9, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="items-center px-8 w-full"
            >
              <View className="bg-red-500/10 p-6 rounded-full mb-8 border border-red-500/20">
                <MaterialCommunityIcons name="alert-decagram-outline" size={60} color="#f87171" />
              </View>

              <Text className="font-main-bold text-3xl text-white text-center mb-3">
                System Hiccup!
              </Text>
              
              <Text className="font-main-md text-slate-400 text-center mb-10 leading-6 text-base">
                Something unexpected happened. We've captured the logs and are ready to get you back in the game.
              </Text>

              <View className="w-full space-y-4">
                <TouchableOpacity
                  onPress={this.handleReset}
                  activeOpacity={0.8}
                  className="overflow-hidden rounded-2xl shadow-2xl shadow-indigo-500/40"
                >
                  <LinearGradient
                    colors={["#6366f1", "#4f46e5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="py-5 items-center"
                  >
                    <Text className="font-main-bold text-white uppercase tracking-[3px] text-base">
                      Resume Session
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View className="flex-row gap-x-3">
                    <TouchableOpacity
                    onPress={this.handleCopyError}
                    className="flex-1 bg-white/5 border border-white/10 py-5 rounded-2xl items-center active:bg-white/10"
                    >
                    <Text className="font-main-bold text-white/60 uppercase tracking-[1px] text-[11px]">
                        Copy Error Code
                    </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                    onPress={this.handleReport}
                    className="flex-1 bg-red-500/10 border border-red-500/20 py-5 rounded-2xl items-center active:bg-red-500/20"
                    >
                    <Text className="font-main-bold text-red-400 uppercase tracking-[1px] text-[11px]">
                        Report Bug
                    </Text>
                    </TouchableOpacity>
                </View>
              </View>
            </MotiView>
          </AnimatePresence>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050508",
    alignItems: "center",
    justifyContent: "center",
  },
});
