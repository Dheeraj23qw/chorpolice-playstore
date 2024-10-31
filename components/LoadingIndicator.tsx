import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { responsiveHeight, responsiveFontSize } from "react-native-responsive-dimensions";

const LoadingIndicator: React.FC<{ loading: boolean; message?: string }> = ({ loading, message }) => {
  if (!loading) return null; // Don't render if not loading

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#7653ec" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveHeight(2),
  },
  message: {
    marginTop: responsiveHeight(1),
    fontSize: responsiveFontSize(2.4),
    color: "white",
    fontFamily: "outfit-bold",
  },
});

export default LoadingIndicator;
