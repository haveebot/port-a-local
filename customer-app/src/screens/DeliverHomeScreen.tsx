import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  getActiveRestaurants,
  isOpenNow,
} from "@palocal/data/delivery-restaurants";
import type { DeliveryRestaurant } from "@palocal/data/delivery-types";
import { colors } from "../lib/theme";
import { useCart } from "../lib/cart";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "DeliverHome">;

export default function DeliverHomeScreen({ navigation }: Props) {
  const restaurants = useMemo(() => getActiveRestaurants(), []);
  const { count } = useCart();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PAL DELIVERY</Text>
          <Text style={styles.title}>Local food,{"\n"}to your beach house.</Text>
          <View style={styles.coralLine} />
          <Text style={styles.sub}>
            Real Port Aransas spots. Local runners. We pick up, we deliver — you
            eat on the porch.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>RESTAURANTS</Text>

        {restaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            onPress={() =>
              navigation.navigate("Restaurant", { slug: r.slug })
            }
          />
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>

      {count > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Cart")}
        >
          <View style={styles.cartCountChip}>
            <Text style={styles.cartCountText}>{count}</Text>
          </View>
          <Text style={styles.cartBarText}>View cart</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function RestaurantCard({
  restaurant,
  onPress,
}: {
  restaurant: DeliveryRestaurant;
  onPress: () => void;
}) {
  const open = isOpenNow(restaurant);
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View
        style={[
          styles.cardAccent,
          { backgroundColor: restaurant.accent ?? colors.coral[500] },
        ]}
      />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{restaurant.name}</Text>
          <View style={[styles.statusPill, open ? styles.openPill : styles.closedPill]}>
            <View style={[styles.statusDot, open ? styles.openDot : styles.closedDot]} />
            <Text style={[styles.statusText, open ? styles.openText : styles.closedText]}>
              {open ? "Open" : "Closed"}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {restaurant.shortDescription}
        </Text>
        <View style={styles.tagsRow}>
          {restaurant.cuisineTags.slice(0, 3).map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { paddingBottom: 24 },
  hero: {
    backgroundColor: colors.navy[950],
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  eyebrow: {
    color: colors.coral[400],
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: colors.sand[50],
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  coralLine: {
    height: 1,
    width: 56,
    backgroundColor: colors.coral[500],
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
    color: colors.navy[500],
    letterSpacing: 1.6,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
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
  cardAccent: { height: 3 },
  cardBody: { padding: 18 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.navy[900],
    flex: 1,
    marginRight: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  openPill: { backgroundColor: colors.seafoam[50] },
  closedPill: { backgroundColor: colors.sand[100] },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  openDot: { backgroundColor: colors.seafoam[500] },
  closedDot: { backgroundColor: colors.navy[400] },
  statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  openText: { color: colors.seafoam[600] },
  closedText: { color: colors.navy[500] },
  cardDesc: {
    fontSize: 14,
    color: colors.navy[600],
    lineHeight: 20,
    marginBottom: 10,
  },
  tagsRow: { flexDirection: "row", gap: 6 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.sand[100],
  },
  tagText: { fontSize: 11, color: colors.navy[700] },
  cartBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: colors.coral[500],
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 12,
    shadowColor: colors.coral[600],
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cartCountChip: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cartCountText: {
    color: colors.coral[600],
    fontWeight: "800",
    fontSize: 13,
  },
  cartBarText: { color: "#fff", fontWeight: "700", flex: 1, fontSize: 15 },
});
