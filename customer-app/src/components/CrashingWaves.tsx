import React, { useEffect, useRef, useMemo, memo } from "react";
import { View, Text, Animated, useWindowDimensions, StyleSheet, Easing } from "react-native";
import Svg, { Path, G } from "react-native-svg";
import type { CoastalConditions } from "../lib/coastalConditions";
import { useReducedMotion } from "../lib/useReducedMotion";
import { getGoldenHourIntensity } from "../lib/solarTimes";
import { colors } from "../lib/theme";

const STAGE_HEIGHT = 150;

// Same wave silhouettes as the web hero, single screen-width tile (1440 viewBox).
// Two copies are rendered side-by-side and translated -screen-width to loop seamlessly.
const PATHS = {
  back:  "M0,120 C240,90 480,150 720,120 C960,90 1200,150 1440,120 L1440,180 L0,180 Z",
  mid:   "M0,140 C180,110 360,170 540,140 C720,110 900,170 1080,140 C1260,110 1440,170 1440,140 L1440,180 L0,180 Z",
  front: "M0,150 C120,125 240,175 360,150 C480,125 600,175 720,150 C840,125 960,175 1080,150 C1200,125 1320,175 1440,150 L1440,180 L0,180 Z",
};

interface WaveLayerProps {
  width: number;
  duration: number;
  reverse?: boolean;
  path: string;
  color: string;
  opacity: number;
  bottomOffset: number;
  zIndex: number;
  reduceMotion: boolean;
}

function WaveLayer({ width, duration, reverse, path, color, opacity, bottomOffset, zIndex, reduceMotion }: WaveLayerProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;
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
  }, [duration, reduceMotion]); // Removed 'anim' from dependencies

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? [-width, 0] : [0, -width],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        bottom: bottomOffset,
        width: width * 2,
        height: STAGE_HEIGHT,
        transform: [{ translateX }],
        zIndex,
      }}
    >
      <Svg width={width * 2} height={STAGE_HEIGHT} viewBox="0 0 2880 180" preserveAspectRatio="none">
        <G>
          <Path d={path} fill={color} fillOpacity={opacity} />
          <Path d={path} fill={color} fillOpacity={opacity} transform="translate(1440, 0)" />
        </G>
      </Svg>
    </Animated.View>
  );
}

// Apply React.memo to prevent unnecessary re-renders of the wave layer
const MemoizedWaveLayer = memo(WaveLayer);

interface Props {
  conditions: CoastalConditions | null;
}

export default function CrashingWaves({ conditions }: Props) {
  const reduceMotion = useReducedMotion();
  const { width: screenWidth } = useWindowDimensions();

  // Memoize golden intensity calculation
  const goldenIntensity = useMemo(() => getGoldenHourIntensity(), []);
  const goldenOpacity = useMemo(() => goldenIntensity * 0.28, [goldenIntensity]);

  // Memoize tide offset calculation based on conditions
  const tideOffset = useMemo(() => {
    // Port Aransas tides typically swing 0–2.5 ft (MLLW).
    // Map tide level to a vertical wave shift around a 1.0 ft "neutral" baseline.
    return conditions?.tideLevelFt != null
      ? Math.round(Math.max(-1, Math.min(2, conditions.tideLevelFt - 1.0)) * 12)
      : 0;
  }, [conditions]);

  const tideValue = conditions?.tideLevelFt != null ? conditions.tideLevelFt.toFixed(1) : "— —";
  const dirLabel = conditions?.tideDirection
    ? `TIDE · ${conditions.tideDirection.toUpperCase()}`
    : "TIDE";

  return (
    <View
      style={styles.stage}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <MemoizedWaveLayer 
        width={screenWidth} 
        duration={22000}            
        path={PATHS.back}  
        color={colors.navy[700]} 
        opacity={0.45} 
        bottomOffset={tideOffset - 4}  
        zIndex={1} 
        reduceMotion={reduceMotion} 
      />
      <MemoizedWaveLayer 
        width={screenWidth} 
        duration={14000} 
        reverse    
        path={PATHS.mid}   
        color={colors.navy[600]} 
        opacity={0.65} 
        bottomOffset={tideOffset - 8}  
        zIndex={2} 
        reduceMotion={reduceMotion} 
      />
      <MemoizedWaveLayer 
        width={screenWidth} 
        duration={9000}             
        path={PATHS.front} 
        color={colors.navy[500]} 
        opacity={0.92} 
        bottomOffset={tideOffset - 12} 
        zIndex={3} 
        reduceMotion={reduceMotion} 
      />

      {/* Golden-hour wash — coral/gold tint that strengthens as sunset approaches */}
      {goldenOpacity > 0 && (
        <View
          pointerEvents="none"
          style={[
            styles.goldenWash,
            { backgroundColor: `rgba(232, 101, 111, ${goldenOpacity.toFixed(3)})` },
          ]}
        />
      )}

      {/* Tide readout — sits above wave layers with a soft scrim for legibility */}
      <View style={styles.numberLayer} pointerEvents="none">
        <View style={styles.scrim} />
        <View style={styles.numberRow}>
          <Text style={styles.tideNumber} maxFontSizeMultiplier={1.2} allowFontScaling>
            {tideValue}
          </Text>
          <Text style={styles.tideUnit} maxFontSizeMultiplier={1.2}>
            ft
          </Text>
        </View>
        <Text style={styles.tideLabel} maxFontSizeMultiplier={1.3}>
          {dirLabel}
        </Text>
      </View>
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
    right: 18,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "flex-end",
    zIndex: 4,
  },
  // Soft dark scrim behind the readout so translucent text always meets WCAG
  // regardless of which wave layer is currently below it.
  scrim: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(11, 17, 32, 0.55)",
    borderRadius: 12,
  },
  // Golden-hour wash: blended coral over the wave area for that sunset glow.
  goldenWash: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 3,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  tideNumber: {
    fontFamily: "Georgia",
    fontSize: 68,
    fontWeight: "300",
    color: "#f5f0e6",
    lineHeight: 70,
    includeFontPadding: false,
  },
  tideUnit: {
    fontFamily: "Georgia",
    fontSize: 22,
    fontWeight: "400",
    color: "rgba(245, 240, 230, 0.95)",
    marginLeft: 6,
    marginBottom: 8,
  },
  tideLabel: {
    fontFamily: "Menlo",
    fontSize: 9,
    letterSpacing: 2.2,
    color: "#ebd492",
    marginTop: 4,
  },
});
