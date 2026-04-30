import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Dimensions, StyleSheet, Easing } from "react-native";
import Svg, { Path, G } from "react-native-svg";
import { useCoastalConditions } from "../lib/coastalConditions";
import { colors } from "../lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const STAGE_HEIGHT = 150;

// Same wave silhouettes as the web hero, single screen-width tile (1440 viewBox).
// Two copies are rendered side-by-side and translated -screen-width to loop seamlessly.
const PATHS = {
  back:  "M0,120 C240,90 480,150 720,120 C960,90 1200,150 1440,120 L1440,180 L0,180 Z",
  mid:   "M0,140 C180,110 360,170 540,140 C720,110 900,170 1080,140 C1260,110 1440,170 1440,140 L1440,180 L0,180 Z",
  front: "M0,150 C120,125 240,175 360,150 C480,125 600,175 720,150 C840,125 960,175 1080,150 C1200,125 1320,175 1440,150 L1440,180 L0,180 Z",
};

interface WaveLayerProps {
  duration: number;
  reverse?: boolean;
  path: string;
  color: string;
  opacity: number;
  bottomOffset: number;
  zIndex: number;
}

function WaveLayer({ duration, reverse, path, color, opacity, bottomOffset, zIndex }: WaveLayerProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [anim, duration]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? [-SCREEN_WIDTH, 0] : [0, -SCREEN_WIDTH],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        bottom: bottomOffset,
        width: SCREEN_WIDTH * 2,
        height: STAGE_HEIGHT,
        transform: [{ translateX }],
        zIndex,
      }}
    >
      <Svg width={SCREEN_WIDTH * 2} height={STAGE_HEIGHT} viewBox="0 0 2880 180" preserveAspectRatio="none">
        <G>
          <Path d={path} fill={color} fillOpacity={opacity} />
          <Path d={path} fill={color} fillOpacity={opacity} transform="translate(1440, 0)" />
        </G>
      </Svg>
    </Animated.View>
  );
}

export default function CrashingWaves() {
  const conditions = useCoastalConditions();

  // Port Aransas tides typically swing 0–2.5 ft (MLLW).
  // Map tide level to a vertical wave shift around a 1.0 ft "neutral" baseline.
  const tideOffset =
    conditions?.tideLevelFt != null
      ? Math.round(Math.max(-1, Math.min(2, conditions.tideLevelFt - 1.0)) * 12)
      : 0;

  const tideValue = conditions?.tideLevelFt != null ? conditions.tideLevelFt.toFixed(1) : "— —";
  const dirLabel = conditions?.tideDirection
    ? `TIDE · ${conditions.tideDirection.toUpperCase()}`
    : "TIDE";

  return (
    <View style={styles.stage} pointerEvents="none">
      {/* Big translucent tide number sitting in the wave field */}
      <View style={styles.numberLayer} pointerEvents="none">
        <View style={styles.numberRow}>
          <Text style={styles.tideNumber}>{tideValue}</Text>
          <Text style={styles.tideUnit}>ft</Text>
        </View>
        <Text style={styles.tideLabel}>{dirLabel}</Text>
      </View>

      <WaveLayer duration={22000}            path={PATHS.back}  color={colors.navy[700]} opacity={0.45} bottomOffset={tideOffset - 4}  zIndex={1} />
      <WaveLayer duration={14000} reverse    path={PATHS.mid}   color={colors.navy[600]} opacity={0.65} bottomOffset={tideOffset - 8}  zIndex={2} />
      <WaveLayer duration={9000}             path={PATHS.front} color={colors.navy[500]} opacity={0.92} bottomOffset={tideOffset - 12} zIndex={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: STAGE_HEIGHT,
    overflow: "hidden",
  },
  numberLayer: {
    position: "absolute",
    right: 24,
    bottom: 14,
    alignItems: "flex-end",
    zIndex: 4,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  tideNumber: {
    fontFamily: "Georgia",
    fontSize: 68,
    fontWeight: "300",
    color: "rgba(245, 240, 230, 0.85)",
    lineHeight: 70,
    includeFontPadding: false,
  },
  tideUnit: {
    fontFamily: "Georgia",
    fontSize: 22,
    fontWeight: "400",
    color: "rgba(245, 240, 230, 0.55)",
    marginLeft: 6,
    marginBottom: 8,
  },
  tideLabel: {
    fontFamily: "Menlo",
    fontSize: 9,
    letterSpacing: 2.2,
    color: "rgba(224, 190, 106, 0.85)",
    marginTop: 4,
  },
});
