import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnlineStatus } from "../lib/useOnlineStatus";
import { useReducedMotion } from "../lib/useReducedMotion";
import { colors } from "../lib/theme";

/**
 * Persistent banner that slides in from the top when the device drops off the
 * network. Hidden when online so it stays out of the way during normal use.
 */
export default function OfflineBanner() {
  const online = useOnlineStatus();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const slide = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (reduceMotion) {
      slide.setValue(online ? -80 : 0);
      return;
    }
    Animated.timing(slide, {
      toValue: online ? -80 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [online, reduceMotion, slide]);

  if (online && reduceMotion) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.banner,
        { paddingTop: insets.top + 6, transform: [{ translateY: slide }] },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Ionicons name="cloud-offline" size={14} color={colors.coral[100]} />
      <Text style={styles.text}>You&apos;re offline — some things may not work</Text>
    </Animated.View>
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
