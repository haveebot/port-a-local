import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { webUrl } from "../lib/config";

interface RowProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  accent?: string;
}

function Row({ icon, label, sublabel, onPress, accent }: RowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: accent ?? colors.navy[100] },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={accent ? "#fff" : colors.navy[700]}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sublabel && <Text style={styles.rowSub}>{sublabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.navy[300]} />
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR ISLAND</Text>
        <Text style={styles.title}>Welcome to Port A.</Text>
        <View style={styles.coralLine} />
        <Text style={styles.sub}>
          Sign in to track orders, save favorite spots, and get push updates from local runners.
        </Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signinButton} activeOpacity={0.85}>
          <Ionicons name="logo-apple" size={18} color="#fff" />
          <Text style={styles.signinText}>Sign in with Apple</Text>
        </TouchableOpacity>
        <Text style={styles.signinHint}>
          Sign-in is optional — you can order as a guest.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>YOUR ACTIVITY</Text>
        <View style={styles.card}>
          <Row
            icon="receipt"
            label="My Orders"
            sublabel="Track deliveries, requests, rentals"
            accent={colors.coral[500]}
            onPress={() => Linking.openURL(webUrl("/deliver"))}
          />
          <View style={styles.divider} />
          <Row
            icon="heart"
            label="Saved Places"
            sublabel="Your favorite spots on the island"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <Row
            icon="map"
            label="My Trip"
            sublabel="Plan your visit"
            onPress={() => Linking.openURL(webUrl("/"))}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>FOR LOCALS</Text>
        <View style={styles.card}>
          <Row
            icon="briefcase"
            label="Become a Runner"
            sublabel="Deliver food, earn local"
            accent={colors.gold[500]}
            onPress={() => Linking.openURL(webUrl("/deliver/runner"))}
          />
          <View style={styles.divider} />
          <Row
            icon="storefront"
            label="List Your Business"
            sublabel="Get vetted, get listed"
            onPress={() => Linking.openURL(webUrl("/locals/offer"))}
          />
          <View style={styles.divider} />
          <Row
            icon="chatbubbles"
            label="Wheelhouse"
            sublabel="Local comms hub"
            onPress={() => Linking.openURL(webUrl("/wheelhouse"))}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.card}>
          <Row
            icon="help-circle"
            label="Help & FAQ"
            onPress={() => Linking.openURL(webUrl("/"))}
          />
          <View style={styles.divider} />
          <Row
            icon="document-text"
            label="Terms"
            onPress={() => Linking.openURL(webUrl("/terms"))}
          />
          <View style={styles.divider} />
          <Row
            icon="shield-checkmark"
            label="Privacy"
            onPress={() => Linking.openURL(webUrl("/privacy"))}
          />
        </View>
      </View>

      <Text style={styles.footer}>Port A Local · v1.0</Text>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { paddingBottom: 24 },
  header: {
    backgroundColor: colors.navy[950],
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[400],
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.sand[50],
    marginBottom: 8,
  },
  coralLine: {
    height: 1,
    width: 56,
    backgroundColor: colors.coral[500],
    marginVertical: 12,
  },
  sub: {
    fontSize: 14,
    color: colors.navy[200],
    lineHeight: 20,
    fontWeight: "300",
  },
  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy[500],
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand[200],
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: { fontSize: 15, fontWeight: "600", color: colors.navy[900] },
  rowSub: { fontSize: 12, color: colors.navy[400], marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: colors.sand[100],
    marginLeft: 60,
  },
  signinButton: {
    backgroundColor: colors.navy[950],
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signinText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  signinHint: {
    color: colors.navy[400],
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  footer: {
    color: colors.navy[300],
    fontSize: 11,
    textAlign: "center",
    marginTop: 32,
    letterSpacing: 0.5,
  },
});
