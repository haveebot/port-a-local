import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnlineStatus } from "../lib/useOnlineStatus";
import { colors } from "../lib/theme";

/**
 * Persistent coral banner shown above all screens when the device has no
 * network. Renders nothing while online to stay out of the way.
 */
export default function OfflineBanner() {
  const online = useOnlineStatus();
  const insets = useSafeAreaInsets();

  if (online) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.banner, { paddingTop: insets.top + 6 }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Ionicons name="cloud-offline" size={14} color={colors.coral[100]} />
      <Text style={styles.text}>You&apos;re offline — some things may not work</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 10,
    backgroundColor: colors.coral[700],
    zIndex: 999,
  },
  text: {
    color: colors.coral[100],
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
