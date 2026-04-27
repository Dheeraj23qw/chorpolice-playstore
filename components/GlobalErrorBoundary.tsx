import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
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
    // You could also log to Sentry/Firebase here in the future
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    router.dismissAll();
    router.replace("/");
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View className="items-center px-10">
            <Text className="text-6xl mb-6">⚠️</Text>
            <Text className="font-main-bold text-2xl text-white text-center mb-4">
              Oops! Something went wrong.
            </Text>
            <Text className="font-main-md text-slate-400 text-center mb-10 leading-6">
              The app encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            <TouchableOpacity
              onPress={this.handleReset}
              className="bg-indigo-600 px-10 py-4 rounded-2xl shadow-xl active:scale-95"
            >
              <Text className="font-main-bold text-white uppercase tracking-widest">
                Return to Safety
              </Text>
            </TouchableOpacity>

            {__DEV__ && (
              <View className="mt-10 p-4 bg-red-950/30 rounded-xl border border-red-500/20">
                <Text className="text-red-400 font-mono text-[10px]">
                  {this.state.error?.toString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.children;
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
