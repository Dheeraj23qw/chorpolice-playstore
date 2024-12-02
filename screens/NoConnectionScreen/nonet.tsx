import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { styles } from "./nonetStyles";


export const NoConnectionScreen = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRetry = () => {
    setIsLoading(true);

    setTimeout(() => {
      console.log("Retry logic goes here");
      setIsLoading(false); 
    }, 2000); 
  };
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/bg/net.png")}
        style={styles.image}
        resizeMode="contain"
      />

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
