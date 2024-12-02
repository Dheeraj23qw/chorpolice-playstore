import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Network from 'expo-network';

const NetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsConnected(networkState.isConnected ?? null); // Handle undefined case
      } catch (error) {
        console.error("Error checking network state:", error);
        setIsConnected(null); // Fallback to null on error
      }
    };

    checkNetwork();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {isConnected === null
          ? "Checking network status..."
          : isConnected
          ? "Internet is available ✅"
          : "No internet connection ❌"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NetworkStatus;
