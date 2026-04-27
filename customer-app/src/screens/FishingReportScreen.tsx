import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { webUrl } from "../lib/config";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "FishingReport">;

interface Season {
  name: string;
  months: string;
  emoji: string;
  species: { name: string; detail: string }[];
}

const SEASONS: Season[] = [
  {
    name: "Spring",
    months: "Mar – May",
    emoji: "🌸",
    species: [
      { name: "Speckled Trout", detail: "Active on flats, channel edges, grass beds" },
      { name: "Redfish", detail: "Moving onto shallow flats, feeding aggressively" },
      { name: "Jack Crevalle", detail: "Arrive in schools, aggressive strikes" },
      { name: "Pompano", detail: "Cruise the surf during spring migration" },
      { name: "King Mackerel", detail: "Begin moving into nearshore waters" },
      { name: "Sheepshead", detail: "Good through early spring around structure" },
    ],
  },
  {
    name: "Summer",
    months: "Jun – Aug",
    emoji: "☀️",
    species: [
      { name: "Red Snapper", detail: "Peak — federal charter season Jun – Oct" },
      { name: "King Mackerel", detail: "Strong offshore and nearshore" },
      { name: "Tarpon", detail: "Roll through the surf and jetties (catch & release)" },
      { name: "Cobia (Ling)", detail: "Follow rays and turtles nearshore" },
      { name: "Mahi-Mahi", detail: "Offshore at rigs and weed lines" },
      { name: "Sharks", detail: "Blacktip, bull sharks common when water > 78°F" },
    ],
  },
  {
    name: "Fall",
    months: "Sep – Nov",
    emoji: "🍂",
    species: [
      { name: "Bull Redfish", detail: "Stack at the jetties during migration — best months" },
      { name: "Flounder", detail: "Stage before spawning run (closed Nov 1 – Dec 14)" },
      { name: "Speckled Trout", detail: "Excellent action in bays" },
      { name: "Wahoo", detail: "Start biting offshore in October" },
      { name: "Pompano", detail: "Return to the surf during fall migration" },
    ],
  },
  {
    name: "Winter",
    months: "Dec – Feb",
    emoji: "❄️",
    species: [
      { name: "Speckled Trout", detail: "Slow and methodical; deeper holes" },
      { name: "Black Drum", detail: "Reliable in the channels and around bridges" },
      { name: "Sheepshead", detail: "Strong bite around pilings and the jetties" },
      { name: "Redfish", detail: "Cruising warm flats on sunny days" },
    ],
  },
];

export default function FishingReportScreen({ navigation }: Props) {
  useEffect(() => {
    navigation.setOptions({ title: "Fishing Report" });
  }, [navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>FISHING REPORT</Text>
        <Text style={styles.title}>What&apos;s biting,{"\n"}and when.</Text>
        <View style={styles.line} />
        <Text style={styles.sub}>
          Seasonal species, bait notes, and regulations on the water around
          Port Aransas.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.conditionsCard}
        activeOpacity={0.85}
        onPress={() => Linking.openURL(webUrl("/fishing-report"))}
      >
        <View style={styles.conditionsRow}>
          <Ionicons name="water" size={22} color={colors.ocean[500]} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.conditionsTitle}>Live conditions</Text>
            <Text style={styles.conditionsSub}>
              Tides, water temp, wind, swell — open in the web view.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.navy[300]} />
        </View>
      </TouchableOpacity>

      {SEASONS.map((season) => (
        <View key={season.name} style={styles.section}>
          <View style={styles.seasonHeader}>
            <Text style={styles.seasonEmoji}>{season.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.seasonName}>{season.name}</Text>
              <Text style={styles.seasonMonths}>{season.months}</Text>
            </View>
          </View>
          {season.species.map((sp) => (
            <View key={sp.name} style={styles.specRow}>
              <Text style={styles.specName}>{sp.name}</Text>
              <Text style={styles.specDetail}>{sp.detail}</Text>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity
        style={styles.openWebButton}
        onPress={() => Linking.openURL(webUrl("/fishing-report"))}
        activeOpacity={0.85}
      >
        <Text style={styles.openWebText}>Full report on theportalocal.com</Text>
        <Ionicons name="open-outline" size={16} color={colors.coral[500]} />
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: {},
  hero: {
    backgroundColor: colors.navy[950],
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  eyebrow: {
    color: colors.ocean[400],
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: colors.sand[50],
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Georgia",
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  line: {
    height: 1,
    width: 56,
    backgroundColor: colors.ocean[500],
    marginVertical: 14,
  },
  sub: {
    color: colors.navy[200],
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "300",
  },
  conditionsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sand[200],
  },
  conditionsRow: { flexDirection: "row", alignItems: "center" },
  conditionsTitle: { fontSize: 14, fontWeight: "700", color: colors.navy[900] },
  conditionsSub: { fontSize: 12, color: colors.navy[400], marginTop: 2 },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sand[200],
  },
  seasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  seasonEmoji: { fontSize: 32, marginRight: 12 },
  seasonName: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Georgia",
    color: colors.navy[900],
    letterSpacing: -0.3,
  },
  seasonMonths: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 1.5,
    marginTop: 2,
  },
  specRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.sand[100],
  },
  specName: { fontSize: 14, fontWeight: "700", color: colors.navy[800] },
  specDetail: {
    fontSize: 13,
    color: colors.navy[500],
    marginTop: 2,
    lineHeight: 18,
  },
  openWebButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 20,
  },
  openWebText: { color: colors.coral[500], fontWeight: "700", fontSize: 14 },
});
