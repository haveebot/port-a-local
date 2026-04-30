import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Polygon, Path, G } from "react-native-svg";
import { useReducedMotion } from "../lib/useReducedMotion";

const STAGE_SIZE = 220;
const BEAM_SIZE = 540; // tuned to cover hero while limiting off-screen overdraw
const LAMP_OFFSET_X = STAGE_SIZE * 0.46;
const LAMP_OFFSET_Y = STAGE_SIZE * 0.18;

export default function LighthouseBeacon() {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const r = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const p = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    r.start();
    p.start();
    return () => {
      r.stop();
      p.stop();
    };
  }, [rotation, pulse, reduceMotion]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const lampOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const lampScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });

  return (
    <View
      style={styles.stage}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Rotating beam — Animated.View centered on the lamp, rotates 360° per loop */}
      <Animated.View style={[styles.beamWrap, { transform: [{ rotate }] }]}>
        <Svg width={BEAM_SIZE} height={BEAM_SIZE} viewBox={`0 0 ${BEAM_SIZE} ${BEAM_SIZE}`}>
          <Defs>
            <LinearGradient id="beam" x1="50%" y1="50%" x2="50%" y2="0%">
              <Stop offset="0%" stopColor="#fff5d7" stopOpacity={0.55} />
              <Stop offset="55%" stopColor="#f5d29a" stopOpacity={0.18} />
              <Stop offset="100%" stopColor="#f5d29a" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {/* Cone polygon: apex at center, narrow wedge extending to the top edge */}
          <Polygon
            points={`${BEAM_SIZE / 2},${BEAM_SIZE / 2} ${BEAM_SIZE / 2 - 38},0 ${BEAM_SIZE / 2 + 38},0`}
            fill="url(#beam)"
          />
        </Svg>
      </Animated.View>

      {/* Lighthouse silhouette watermark — Lydia Ann mark, low-opacity sand */}
      <View style={styles.silhouette}>
        <Svg width={STAGE_SIZE} height={STAGE_SIZE} viewBox="0 0 128 128">
          <G fill="#f5f0e8" fillOpacity={0.09}>
            <Path d="M47.74,121.7l1.32-13.84c.07-.72-.02-1.33.35-2.02l28.18-12.01,2.66,27.86h-32.52Z" />
            <Polygon points="76.4,81.09 50.56,92.1 51.81,78.93 75.21,68.94 76.4,81.09" />
            <Path
              fillRule="evenodd"
              d="M74.15,57.08l-20.98,8.95c-.16-1.1.05-1.79.13-2.64l.73-8.09c.05-.55.43-1.49.01-1.91-1.14-.58-2.21-1.55-1.93-2.31.08-.22.31-.48.68-.48h1.58s0-13.11,0-13.11h-1.58c-.26-.01-.44-.16-.54-.27-.19-.2-.18-.48-.1-.71.31-.96,1.05-1.27,1.81-1.75,4.36-2.78,5.93-7.33,8.3-9.01,1.07-.76,2.44-.77,3.52,0,2.47,1.77,4.31,6.95,9.07,9.46.78.41,1.26,1.42,1,1.9-.09.16-.31.36-.62.36h-1.58s0,13.11,0,13.11h1.58c.48.02.77.44.69.85-.21,1.08-1.13,1.44-1.95,1.94-.39.4-.03,1.3.01,1.76.06.68-.05,1.17.19,1.94ZM69.96,37.47h-11.91v13.13h11.91v-13.13Z"
            />
          </G>
        </Svg>
      </View>

      {/* Pulsing lamp glow */}
      <Animated.View style={[styles.lamp, { opacity: lampOpacity, transform: [{ scale: lampScale }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    position: "absolute",
    right: -36,
    top: 56,
    width: STAGE_SIZE,
    height: STAGE_SIZE,
  },
  beamWrap: {
    position: "absolute",
    left: LAMP_OFFSET_X - BEAM_SIZE / 2,
    top: LAMP_OFFSET_Y - BEAM_SIZE / 2,
    width: BEAM_SIZE,
    height: BEAM_SIZE,
  },
  silhouette: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  lamp: {
    position: "absolute",
    left: LAMP_OFFSET_X - 7,
    top: LAMP_OFFSET_Y - 7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff5d7",
    shadowColor: "#f5d29a",
    shadowOpacity: 0.85,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
});
