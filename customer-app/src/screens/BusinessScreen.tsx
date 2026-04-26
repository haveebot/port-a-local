import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { businesses } from "../data/businesses";
import { BrowseStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<BrowseStackParamList, "Business">;

export default function BusinessScreen({ route, navigation }: Props) {
  const { slug, preview } = route.params;
  const business = preview ?? businesses.find((b) => b.slug === slug);

  React.useEffect(() => {
    if (business) navigation.setOptions({ title: business.name });
  }, [business, navigation]);

  if (!business) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Business not found.</Text>
      </View>
    );
  }

  const callPhone = () => {
    const tel = business.phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${tel}`).catch(() =>
      Alert.alert("Could not place call")
    );
  };

  const openMap = () => {
    const q = encodeURIComponent(business.address);
    Linking.openURL(`http://maps.apple.com/?q=${q}`).catch(() =>
      Alert.alert("Could not open Maps")
    );
  };

  const openSite = () => {
    if (!business.website) return;
    Linking.openURL(business.website).catch(() =>
      Alert.alert("Could not open website")
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.heroBlock}>
        <View style={styles.coralAccent} />
        <View style={styles.heroPadding}>
          <Text style={styles.eyebrow}>{business.category.toUpperCase()}</Text>
          <Text style={styles.title}>{business.name}</Text>
          {business.verifiedPartner && (
            <View style={styles.verifiedRow}>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>VERIFIED LOCAL PARTNER</Text>
              </View>
            </View>
          )}
          <View style={styles.coralLine} />
          <Text style={styles.tagline}>{business.tagline}</Text>
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={callPhone}
          activeOpacity={0.85}
        >
          <Ionicons name="call" size={20} color={colors.coral[500]} />
          <Text style={styles.actionLabel}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={openMap}
          activeOpacity={0.85}
        >
          <Ionicons name="map" size={20} color={colors.coral[500]} />
          <Text style={styles.actionLabel}>Directions</Text>
        </TouchableOpacity>
        {business.website && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={openSite}
            activeOpacity={0.85}
          >
            <Ionicons name="globe" size={20} color={colors.coral[500]} />
            <Text style={styles.actionLabel}>Website</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>ABOUT</Text>
        <Text style={styles.body}>{business.description}</Text>
      </View>

      {/* Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>HOURS</Text>
        {business.hoursOfOperation ? (
          <View style={styles.hoursList}>
            {Object.entries(business.hoursOfOperation).map(([day, hours]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{day}</Text>
                <Text style={styles.hoursTime}>{hours}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.body}>{business.hours}</Text>
        )}
      </View>

      {/* Contact + address */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>VISIT</Text>
        <Text style={styles.body}>{business.address}</Text>
        <Text style={[styles.body, { marginTop: 4 }]}>{business.phone}</Text>
      </View>

      {/* Menu */}
      {business.menu && business.menu.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>MENU</Text>
          {business.menu.map((sec) => (
            <View key={sec.section} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{sec.section}</Text>
              {sec.items.map((item, i) => (
                <View key={`${sec.section}-${i}`} style={styles.menuItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.menuItemDesc}>{item.description}</Text>
                    )}
                  </View>
                  {item.price && (
                    <Text style={styles.menuItemPrice}>{item.price}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Charters */}
      {business.charters && business.charters.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>CHARTERS</Text>
          {business.charters.map((c, i) => (
            <View key={i} style={styles.optionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionName}>{c.name}</Text>
                <Text style={styles.optionMeta}>{c.duration}</Text>
                {c.description && (
                  <Text style={styles.optionDesc}>{c.description}</Text>
                )}
              </View>
              <Text style={styles.optionPrice}>{c.price}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Rentals */}
      {business.rentals && business.rentals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>RENTALS</Text>
          {business.rentals.map((r, i) => (
            <View key={i} style={styles.optionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionName}>{r.name}</Text>
                <Text style={styles.optionMeta}>{r.duration}</Text>
                {r.description && (
                  <Text style={styles.optionDesc}>{r.description}</Text>
                )}
              </View>
              <Text style={styles.optionPrice}>{r.price}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: {},
  heroBlock: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.sand[200],
    overflow: "hidden",
  },
  coralAccent: { height: 3, backgroundColor: colors.coral[500] },
  heroPadding: { padding: 22 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.navy[900],
    marginBottom: 8,
  },
  verifiedRow: { flexDirection: "row", marginBottom: 8 },
  verifiedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.gold[100],
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gold[600],
    letterSpacing: 0.8,
  },
  coralLine: {
    height: 1,
    width: 56,
    backgroundColor: colors.coral[500],
    marginVertical: 12,
  },
  tagline: { fontSize: 16, color: colors.navy[700], lineHeight: 22 },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sand[200],
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy[900],
  },
  section: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 2,
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    color: colors.navy[700],
    lineHeight: 22,
  },
  hoursList: { gap: 6 },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand[100],
  },
  hoursDay: { fontSize: 14, fontWeight: "600", color: colors.navy[800] },
  hoursTime: { fontSize: 14, color: colors.navy[600] },
  menuSection: { marginBottom: 18 },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand[100],
  },
  menuItemName: { fontSize: 14, fontWeight: "600", color: colors.navy[800] },
  menuItemDesc: {
    fontSize: 13,
    color: colors.navy[500],
    marginTop: 2,
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy[900],
    marginLeft: 12,
  },
  optionRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand[100],
  },
  optionName: { fontSize: 15, fontWeight: "700", color: colors.navy[900] },
  optionMeta: { fontSize: 12, color: colors.navy[400], marginTop: 2 },
  optionDesc: { fontSize: 13, color: colors.navy[500], marginTop: 4 },
  optionPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.coral[500],
    marginLeft: 12,
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { color: colors.navy[400] },
});
