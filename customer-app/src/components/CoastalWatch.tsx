import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  G,
  Line,
  Path,
  Circle,
  Text as SvgText,
} from "react-native-svg";
import { colors } from "../lib/theme";
import { useCoastalConditions } from "../lib/coastalConditions";

const LOG_ENTRIES = [
  { time: "07:22", note: "Fog rolling in early. Can't see the breakwater from the tower balcony." },
  { time: "09:45", note: "Caught a glimpse of the lighthouse beacon flickering — storm interference?" },
  { time: "11:08", note: "Tide higher than the tables predicted. Station 04 reporting minor spray on the glass." },
  { time: "14:30", note: "Whispers in the wires again. Just the wind, probably." },
  { time: "16:51", note: "Pelicans pushing south of the jetty. Bait pod working the tide line." },
];

function PulsingMarker() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.4] });
  const opacity = pulse.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.85, 0, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.markerPulse,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
}

function LiveDot() {
  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);
  return <Animated.View style={[styles.liveDot, { opacity: blink }]} />;
}

function LogEntry({ time, note, delay }: { time: string; note: string; delay: number }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
    ]).start();
  }, [fade, slide, delay]);
  return (
    <Animated.View style={[styles.logRow, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <Text style={styles.logTime}>{time}</Text>
      <Text style={styles.logNote}>“{note}”</Text>
    </Animated.View>
  );
}

function fmtTemp(v: number | null, fallback: string): string {
  return v == null ? fallback : `${Math.round(v)}°F`;
}
function fmtTide(level: number | null, dir: "rising" | "falling" | null, fallback: string): { value: string; label: string } {
  if (level == null) return { value: fallback, label: "TIDE · RISING" };
  return {
    value: `${level.toFixed(1)} ft`,
    label: dir ? `TIDE · ${dir.toUpperCase()}` : "TIDE",
  };
}

export default function CoastalWatch() {
  const conditions = useCoastalConditions();
  const tide = fmtTide(conditions?.tideLevelFt ?? null, conditions?.tideDirection ?? null, "2.4 ft");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LiveDot />
          <Text style={styles.headerLabel} numberOfLines={1}>COASTAL WATCH · STATION 04</Text>
        </View>
        <Text style={styles.coords} numberOfLines={1}>27°50′N · 97°03′W</Text>
      </View>

      {/* Topographic chart of Mustang Island */}
      <View style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapMeta}>MUSTANG ISLAND</Text>
          <Text style={styles.mapMeta}>CHART 11308</Text>
        </View>
        <View style={styles.mapSvgWrap}>
          <Svg viewBox="0 0 400 240" width="100%" height="100%">
            <Defs>
              <RadialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#f08589" stopOpacity={0.9} />
                <Stop offset="60%" stopColor="#e8656f" stopOpacity={0.3} />
                <Stop offset="100%" stopColor="#e8656f" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            {/* Grid */}
            <G stroke="#3a6597" strokeOpacity={0.18} strokeWidth={0.5} fill="none">
              {Array.from({ length: 7 }).map((_, i) => (
                <Line key={`h${i}`} x1={0} y1={i * 40} x2={400} y2={i * 40} />
              ))}
              {Array.from({ length: 11 }).map((_, i) => (
                <Line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={240} />
              ))}
            </G>
            {/* Island contours */}
            <G fill="none" strokeLinecap="round" strokeLinejoin="round">
              <Path
                d="M70,200 C110,170 160,145 220,120 C280,95 330,75 360,55"
                stroke="#5a8ab8"
                strokeOpacity={0.55}
                strokeWidth={1.1}
              />
              <Path
                d="M85,210 C125,180 175,160 235,135 C295,110 340,90 365,75"
                stroke="#7aaad5"
                strokeOpacity={0.7}
                strokeWidth={1.2}
              />
              <Path
                d="M105,215 C145,190 195,170 255,145 C300,125 335,110 360,95"
                stroke="#a9c8e6"
                strokeOpacity={0.85}
                strokeWidth={1.3}
              />
              <Path
                d="M125,215 C170,195 215,180 270,160 C310,140 335,128 350,118"
                stroke="#d4a843"
                strokeOpacity={0.9}
                strokeWidth={1.4}
              />
            </G>
            {/* Compass */}
            <G stroke="#d4a843" strokeOpacity={0.6} fill="none" strokeWidth={0.8}>
              <Circle cx={48} cy={50} r={12} />
              <Line x1={48} y1={36} x2={48} y2={64} />
              <Line x1={34} y1={50} x2={62} y2={50} />
              <SvgText x={48} y={32} fill="#d4a843" fillOpacity={0.7} fontSize={8} textAnchor="middle" fontFamily="Menlo">N</SvgText>
            </G>
            {/* Marker */}
            <Circle cx={255} cy={140} r={22} fill="url(#markerGlow)" />
            <Circle cx={255} cy={140} r={4} fill="#f08589" />
            <Circle cx={255} cy={140} r={2} fill="#fff5d7" />
            <SvgText x={269} y={144} fill="#f5d29a" fontSize={9} fontFamily="Menlo" letterSpacing={1}>PORT A</SvgText>
          </Svg>
          {/* Animated CSS-style pulse overlay positioned over the SVG marker */}
          <View style={styles.markerOverlay} pointerEvents="none">
            <PulsingMarker />
          </View>
        </View>
      </View>

      {/* The Logbook */}
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <Text style={styles.headerLabel}>THE LOGBOOK</Text>
          <Text style={styles.liveLabel}>LIVE</Text>
        </View>
        {LOG_ENTRIES.map((e, i) => (
          <LogEntry key={e.time} time={e.time} note={e.note} delay={i * 500} />
        ))}
        <View style={styles.instrumentRow}>
          <View style={styles.instrumentCol}>
            <Text style={styles.instrumentValue}>{fmtTemp(conditions?.airTempF ?? null, "76°F")}</Text>
            <Text style={styles.instrumentLabel}>AIR</Text>
          </View>
          <View style={styles.instrumentCol}>
            <Text style={styles.instrumentValue}>{fmtTemp(conditions?.waterTempF ?? null, "71°F")}</Text>
            <Text style={styles.instrumentLabel}>WATER</Text>
          </View>
          <View style={styles.instrumentCol}>
            <Text style={styles.instrumentValue}>{tide.value}</Text>
            <Text style={styles.instrumentLabel}>{tide.label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.navy[950],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(235, 224, 204, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral[400],
    shadowColor: colors.coral[500],
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  headerLabel: {
    fontFamily: "Menlo",
    fontSize: 9,
    letterSpacing: 2.5,
    color: "rgba(222, 205, 171, 0.7)",
  },
  coords: {
    fontFamily: "Menlo",
    fontSize: 9,
    letterSpacing: 2,
    color: "rgba(222, 205, 171, 0.5)",
  },
  mapCard: {
    backgroundColor: "rgba(17, 29, 53, 0.6)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(235, 224, 204, 0.1)",
    padding: 12,
    marginBottom: 12,
    aspectRatio: 1.7,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  mapMeta: {
    fontFamily: "Menlo",
    fontSize: 8,
    letterSpacing: 1.5,
    color: "rgba(222, 205, 171, 0.5)",
  },
  mapSvgWrap: {
    flex: 1,
    position: "relative",
  },
  markerOverlay: {
    position: "absolute",
    left: "63.75%",
    top: "58.3%",
    width: 1,
    height: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  markerPulse: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: -22,
    marginTop: -22,
    backgroundColor: colors.coral[500],
  },
  logCard: {
    backgroundColor: "rgba(17, 29, 53, 0.6)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(235, 224, 204, 0.1)",
    padding: 16,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  liveLabel: {
    fontFamily: "Menlo",
    fontSize: 9,
    letterSpacing: 2,
    color: "rgba(245, 168, 170, 0.85)",
  },
  logRow: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 14,
  },
  logTime: {
    fontFamily: "Menlo",
    fontSize: 11,
    color: "rgba(224, 190, 106, 0.85)",
    width: 44,
    paddingTop: 2,
  },
  logNote: {
    flex: 1,
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(245, 240, 230, 0.9)",
  },
  instrumentRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(235, 224, 204, 0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  instrumentCol: {
    flex: 1,
  },
  instrumentValue: {
    fontSize: 18,
    color: colors.sand[100],
    fontWeight: "500",
    marginBottom: 2,
  },
  instrumentLabel: {
    fontFamily: "Menlo",
    fontSize: 9,
    letterSpacing: 1.8,
    color: "rgba(222, 205, 171, 0.55)",
  },
});
