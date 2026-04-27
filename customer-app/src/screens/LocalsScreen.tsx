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

type Props = NativeStackScreenProps<ServicesStackParamList, "Locals">;

interface CatRow {
  slug: string;
  label: string;
  blurb: string;
  mode: "rent" | "hire";
  icon: string;
}

const CATS: CatRow[] = [
  {
    slug: "beach-gear",
    label: "Beach Gear",
    blurb: "Chairs, umbrellas, coolers — neighbors with extras to lend",
    mode: "rent",
    icon: "umbrella",
  },
  {
    slug: "watercraft",
    label: "Watercraft",
    blurb: "Kayaks, paddleboards, jet skis — locally owned, locally insured",
    mode: "rent",
    icon: "boat",
  },
  {
    slug: "carts",
    label: "Carts & Bikes",
    blurb: "Beach cruisers, golf carts straight from the locals",
    mode: "rent",
    icon: "bicycle",
  },
  {
    slug: "captains",
    label: "Charter Captains",
    blurb: "Locals who fish here every day",
    mode: "hire",
    icon: "fish",
  },
  {
    slug: "photographers",
    label: "Photographers",
    blurb: "Family beach sessions, weddings, wildlife",
    mode: "hire",
    icon: "camera",
  },
  {
    slug: "errands",
    label: "Errand Running",
    blurb: "Groceries, pharmacy, package pickup — get an island regular on it",
    mode: "hire",
    icon: "walk",
  },
  {
    slug: "cleaning",
    label: "Cleaning",
    blurb: "Vacation house turnovers, post-storm tidy-ups",
    mode: "hire",
    icon: "sparkles",
  },
];

export default function LocalsScreen({ navigation }: Props) {
  useEffect(() => {
    navigation.setOptions({ title: "Locals" });
  }, [navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>LOCALS NETWORK</Text>
        <Text style={styles.title}>Rent it from{"\n"}an actual local.</Text>
        <View style={styles.line} />
        <Text style={styles.sub}>
          Beach gear, boats, bikes, captains, photographers, cleaners. People
          who live here, doing things they&apos;re good at.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>RENT</Text>
      {CATS.filter((c) => c.mode === "rent").map((cat) => (
        <CatCard
          key={cat.slug}
          cat={cat}
          onPress={() =>
            Linking.openURL(webUrl(`/locals?mode=rent&cat=${cat.slug}`))
          }
        />
      ))}

      <Text style={styles.sectionLabel}>HIRE</Text>
      {CATS.filter((c) => c.mode === "hire").map((cat) => (
        <CatCard
          key={cat.slug}
          cat={cat}
          onPress={() =>
            Linking.openURL(webUrl(`/locals?mode=hire&cat=${cat.slug}`))
          }
        />
      ))}

      <View style={styles.section}>
        <View style={styles.offerRow}>
          <Ionicons name="megaphone" size={22} color={colors.coral[500]} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.offerTitle}>Got something to share?</Text>
            <Text style={styles.offerSub}>
              Locals — list your gear, services, or skills.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.offerButton}
          onPress={() => Linking.openURL(webUrl("/locals/offer"))}
          activeOpacity={0.85}
        >
          <Text style={styles.offerButtonText}>List your offering</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function CatCard({ cat, onPress }: { cat: CatRow; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.iconCircle}>
        <Ionicons
          name={cat.icon as never}
          size={20}
          color={colors.seafoam[600]}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{cat.label}</Text>
        <Text style={styles.cardBlurb}>{cat.blurb}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.navy[300]} />
    </TouchableOpacity>
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
    color: colors.seafoam[400],
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: colors.sand[50],
    fontSize: 30,
    fontWeight: "700",
    fontFamily: "Georgia",
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  line: {
    height: 1,
    width: 56,
    backgroundColor: colors.seafoam[500],
    marginVertical: 14,
  },
  sub: {
    color: colors.navy[200],
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "300",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 1.6,
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sand[200],
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.seafoam[50],
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.navy[900] },
  cardBlurb: { fontSize: 12, color: colors.navy[500], marginTop: 2 },
  section: {
    backgroundColor: colors.coral[50],
    borderColor: colors.coral[200],
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 22,
    padding: 16,
    borderRadius: 14,
  },
  offerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  offerTitle: { fontSize: 15, fontWeight: "700", color: colors.navy[900] },
  offerSub: { fontSize: 13, color: colors.navy[600], marginTop: 2 },
  offerButton: {
    backgroundColor: colors.coral[500],
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  offerButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
