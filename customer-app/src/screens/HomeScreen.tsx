import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../lib/theme";
import { categories } from "@palocal/data/categories";
import { businesses } from "@palocal/data/businesses";
import { BrowseStackParamList, SERVICES } from "../lib/navigation";

type Nav = NativeStackScreenProps<BrowseStackParamList, "Home">["navigation"];
type Props = NativeStackScreenProps<BrowseStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const featured = businesses.filter((b) => b.featured).slice(0, 6);

  const accentToColor = (
    accent: "coral" | "gold" | "ocean" | "seafoam" | "sunset"
  ) => {
    switch (accent) {
      case "coral":
        return colors.coral[500];
      case "gold":
        return colors.gold[500];
      case "ocean":
        return colors.ocean[500];
      case "seafoam":
        return colors.seafoam[500];
      case "sunset":
        return colors.sunset[500];
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroAccent} />
        <Text style={styles.heroEyebrow}>WELCOME TO PORT A</Text>
        <Text style={styles.heroTitle}>Everything the island{"\n"}has to offer.</Text>
        <View style={styles.coralLine} />
        <Text style={styles.heroSubtitle}>
          Order food, book rentals, request maintenance, and discover places vetted by locals — all in one app.
        </Text>
      </View>

      {/* Quick services */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>QUICK ACTIONS</Text>
        <Text style={styles.sectionTitle}>Order something</Text>
        <View style={styles.serviceGrid}>
          {SERVICES.slice(0, 4).map((s) => (
            <TouchableOpacity
              key={s.slug}
              style={styles.serviceCard}
              activeOpacity={0.85}
              onPress={() => {
                const parent = navigation.getParent();
                if (!parent) return;
                if (s.slug === "deliver") {
                  parent.navigate("Services", { screen: "DeliverHome" });
                } else if (s.slug === "maintenance") {
                  parent.navigate("Services", { screen: "MaintenanceForm" });
                } else if (s.slug === "rent") {
                  parent.navigate("Services", { screen: "RentForm" });
                } else if (s.slug === "beach") {
                  parent.navigate("Services", { screen: "BeachForm" });
                } else {
                  parent.navigate("Services", {
                    screen: "Service",
                    params: { slug: s.slug },
                  });
                }
              }}
            >
              <View
                style={[
                  styles.serviceIconWrap,
                  { backgroundColor: accentToColor(s.accent) },
                ]}
              >
                <Ionicons name={s.icon as any} size={26} color="#fff" />
              </View>
              <Text style={styles.serviceTitle}>{s.title}</Text>
              <Text style={styles.serviceTagline} numberOfLines={2}>
                {s.tagline}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Categories — horizontal icon strip, Stitch-style */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>BROWSE BY CATEGORY</Text>
        <Text style={styles.sectionTitle}>Explore Port Aransas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catStrip}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.slug}
              style={styles.catChip}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("Category", { slug: cat.slug })
              }
            >
              <View style={styles.catChipIconWrap}>
                <Text style={styles.catChipIcon}>{cat.icon}</Text>
              </View>
              <Text style={styles.catChipLabel}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured — single big editorial card up top + supporting cards */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>LOCALS&apos; PICKS</Text>
          <Text style={styles.sectionTitle}>Featured spots</Text>

          {/* Hero featured card */}
          <TouchableOpacity
            style={styles.heroFeatured}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("Business", {
                slug: featured[0].slug,
                preview: featured[0],
              })
            }
          >
            <View style={styles.heroFeaturedImage}>
              <Text style={styles.heroFeaturedEmoji}>
                {categories.find((c) => c.slug === featured[0].category)
                  ?.icon ?? "🌴"}
              </Text>
            </View>
            <View style={styles.heroFeaturedBody}>
              <Text style={styles.heroFeaturedKicker}>
                {featured[0].category.toUpperCase()}
              </Text>
              <Text style={styles.heroFeaturedName}>{featured[0].name}</Text>
              <Text style={styles.heroFeaturedTagline} numberOfLines={2}>
                {featured[0].tagline}
              </Text>
              {featured[0].verifiedPartner && (
                <View style={styles.heroFeaturedVerified}>
                  <Text style={styles.heroFeaturedVerifiedText}>
                    VERIFIED LOCAL
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Supporting featured row (compact) */}
          {featured.slice(1, 5).length > 0 && (
            <View style={styles.featuredList}>
              {featured.slice(1, 5).map((b) => (
                <TouchableOpacity
                  key={b.slug}
                  style={styles.featuredCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate("Business", {
                      slug: b.slug,
                      preview: b,
                    })
                  }
                >
                  <View style={styles.featuredAccent} />
                  <View style={styles.featuredBody}>
                    <View style={styles.featuredHeader}>
                      <Text style={styles.featuredName}>{b.name}</Text>
                      {b.verifiedPartner && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>VERIFIED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.featuredTagline} numberOfLines={2}>
                      {b.tagline}
                    </Text>
                    <Text style={styles.featuredMeta}>
                      {b.category.toUpperCase()} · {b.hours}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { paddingBottom: 24 },
  hero: {
    backgroundColor: colors.navy[950],
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
    position: "relative",
    overflow: "hidden",
  },
  heroAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.coral[500],
  },
  heroEyebrow: {
    color: colors.coral[400],
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 14,
  },
  heroTitle: {
    color: colors.sand[50],
    fontSize: 36,
    fontWeight: "700",
    fontFamily: "Georgia",
    lineHeight: 42,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  coralLine: {
    height: 1,
    width: 56,
    backgroundColor: colors.coral[500],
    marginBottom: 14,
  },
  heroSubtitle: {
    color: colors.navy[200],
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "300",
  },
  section: { paddingHorizontal: 16, paddingTop: 28 },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Georgia",
    color: colors.navy[900],
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.sand[200],
    shadowColor: colors.navy[950],
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  serviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 4,
  },
  serviceTagline: {
    fontSize: 12,
    color: colors.navy[400],
    lineHeight: 16,
  },
  catStrip: { gap: 14, paddingRight: 16 },
  catChip: { alignItems: "center", width: 76 },
  catChipIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.sand[200],
    marginBottom: 8,
    shadowColor: colors.navy[950],
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  catChipIcon: { fontSize: 28 },
  catChipLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.navy[800],
    textAlign: "center",
  },
  heroFeatured: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.sand[200],
    marginBottom: 14,
    shadowColor: colors.navy[950],
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroFeaturedImage: {
    height: 180,
    backgroundColor: colors.navy[800],
    alignItems: "center",
    justifyContent: "center",
  },
  heroFeaturedEmoji: { fontSize: 64, opacity: 0.85 },
  heroFeaturedBody: { padding: 20 },
  heroFeaturedKicker: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  heroFeaturedName: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Georgia",
    color: colors.navy[900],
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroFeaturedTagline: {
    fontSize: 14,
    color: colors.navy[600],
    lineHeight: 20,
    marginBottom: 10,
  },
  heroFeaturedVerified: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.gold[100],
  },
  heroFeaturedVerifiedText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.gold[600],
    letterSpacing: 0.8,
  },
  featuredList: { gap: 12 },
  featuredCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.sand[200],
    shadowColor: colors.navy[950],
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  featuredAccent: { height: 3, backgroundColor: colors.gold[500] },
  featuredBody: { padding: 18 },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  featuredName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.navy[900],
    flex: 1,
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.gold[100],
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.gold[600],
    letterSpacing: 0.8,
  },
  featuredTagline: {
    fontSize: 14,
    color: colors.navy[700],
    lineHeight: 20,
    marginBottom: 10,
  },
  featuredMeta: {
    fontSize: 11,
    color: colors.navy[400],
    letterSpacing: 0.6,
  },
});
