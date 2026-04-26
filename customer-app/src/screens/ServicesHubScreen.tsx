import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { ServicesStackParamList, SERVICES, ServiceDef } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "ServicesHub">;

const accentToColor = (
  accent: ServiceDef["accent"]
): string => {
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

export default function ServicesHubScreen({ navigation }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>SERVICES</Text>
        <Text style={styles.title}>Order anything,{"\n"}from anywhere on the island.</Text>
        <View style={styles.coralLine} />
        <Text style={styles.sub}>
          Tap a service to start. Local runners and vendors handle the rest.
        </Text>
      </View>

      <View style={styles.list}>
        {SERVICES.map((s) => (
          <TouchableOpacity
            key={s.slug}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("Service", { slug: s.slug })
            }
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: accentToColor(s.accent) },
              ]}
            >
              <Ionicons name={s.icon as any} size={28} color="#fff" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.cardTagline}>{s.tagline}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.navy[300]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: {},
  headerBlock: {
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
    fontSize: 28,
    fontWeight: "800",
    color: colors.sand[50],
    lineHeight: 34,
  },
  coralLine: {
    height: 1,
    width: 56,
    backgroundColor: colors.coral[500],
    marginVertical: 14,
  },
  sub: {
    fontSize: 15,
    color: colors.navy[200],
    lineHeight: 22,
    fontWeight: "300",
  },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.sand[200],
    shadowColor: colors.navy[950],
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 2,
  },
  cardTagline: { fontSize: 13, color: colors.navy[500] },
});
