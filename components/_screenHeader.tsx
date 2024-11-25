import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { useRouter } from "expo-router";

interface ScreenHeaderProps {
  name: string;
  showBackButton?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  name,
  showBackButton = true,
}) => {
  const router = useRouter();
  const handleGoBack = () => {
    router.push("/modeselect");
  };

  const backButton = useMemo(() => {
    if (showBackButton) {
      return (
        <TouchableOpacity onPress={handleGoBack}>
          <AntDesign
            name="arrowleft"
            size={34}
            color="#FFD700"
            style={styles.iconStyle}
          />
        </TouchableOpacity>
      );
    }
    return null;
  }, [showBackButton, handleGoBack]);

  return (
    <View style={showBackButton ? styles.header : styles.header1}>
      {backButton}
      <Text style={styles.headerTitle}>{name}</Text>
    </View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({
  header: {
    flex: 1,
    backgroundColor: "#7653ec",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: responsiveWidth(6),
    justifyContent: "flex-start",
    gap: responsiveWidth(9),
    marginTop: responsiveWidth(2),
  },
  headerTitle: {
    color: "#FFD700",
    fontSize: responsiveFontSize(4),
    fontFamily: "outfit-bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  iconStyle: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 2 },
    textShadowRadius: 5,
  },
  header1: {
    flex: 1,
    backgroundColor: "#7653ec",
    flexDirection: "row",
    alignItems: "center",

    justifyContent: "center",
    gap: responsiveWidth(6),
    marginTop: responsiveWidth(2),
  },
});
