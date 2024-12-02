import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ActivityIndicator,
  BackHandler,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./nonetStyles";
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from "react-native-responsive-dimensions";

interface NoConnectionScreenProps {
  handleExitGame: () => void; // Define prop type for handleExitGame function
}

export const NoConnectionScreen: React.FC<NoConnectionScreenProps> = ({
  handleExitGame,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRetry = () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 8000);
    return () => clearTimeout(timer);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={"transparent"} />

      <Image
        source={require("@/assets/images/bg/net.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Pressable style={styles.backButton} onPress={handleExitGame}>
        <Ionicons name="arrow-back" size={rf(2.5)} color="#FFD700" />
      </Pressable>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.message}>No Internet Connection</Text>

        {/* Retry Button or Loader */}
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#333"
                style={styles.loader}
              />
            ) : (
              "Retry"
            )}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

// Add styles as needed
