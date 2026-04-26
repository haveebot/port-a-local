import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  getRestaurant,
  getCategoriesFor,
  getItemsFor,
  isOpenNow,
  customerPrice,
} from "@palocal/data/delivery-restaurants";
import { formatUSD } from "@palocal/data/delivery-pricing";
import type { MenuItem } from "@palocal/data/delivery-types";
import { colors } from "../lib/theme";
import { useCart, CartConflictError } from "../lib/cart";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "Restaurant">;

export default function RestaurantScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const restaurant = getRestaurant(slug);
  const cart = useCart();

  useEffect(() => {
    if (restaurant) navigation.setOptions({ title: restaurant.name });
  }, [restaurant, navigation]);

  const sections = useMemo(() => {
    if (!restaurant) return [];
    const cats = getCategoriesFor(restaurant.id);
    const items = getItemsFor(restaurant.id);
    return cats.map((c) => ({
      cat: c,
      items: items
        .filter((i) => i.categoryId === c.id)
        .sort((a, b) => a.sort - b.sort),
    }));
  }, [restaurant]);

  if (!restaurant) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Restaurant not found.</Text>
      </View>
    );
  }

  const open = isOpenNow(restaurant);

  const handleAdd = (item: MenuItem) => {
    if (!open) {
      Alert.alert(
        "Closed right now",
        `${restaurant.name} is outside its delivery hours. Try again during the next window.`
      );
      return;
    }
    try {
      cart.add(item.id, 1);
    } catch (err) {
      if (err instanceof CartConflictError) {
        Alert.alert(
          "Different restaurant in cart",
          "Your cart already has items from another restaurant. Clear it first?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Clear & add",
              style: "destructive",
              onPress: () => {
                cart.clear();
                cart.add(item.id, 1);
              },
            },
          ]
        );
      } else {
        throw err;
      }
    }
  };

  const inCart = (id: string) =>
    cart.lines.find((l) => l.itemId === id)?.quantity ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View
            style={[
              styles.heroAccent,
              { backgroundColor: restaurant.accent ?? colors.coral[500] },
            ]}
          />
          <View style={styles.heroBody}>
            <View style={styles.heroRow}>
              <View style={styles.heroLeft}>
                <Text style={styles.eyebrow}>
                  {restaurant.cuisineTags.join(" · ").toUpperCase()}
                </Text>
                <Text style={styles.heroTitle}>{restaurant.name}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  open ? styles.openPill : styles.closedPill,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    open ? styles.openDot : styles.closedDot,
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    open ? styles.openText : styles.closedText,
                  ]}
                >
                  {open ? "Open" : "Closed"}
                </Text>
              </View>
            </View>
            <Text style={styles.heroDesc}>{restaurant.shortDescription}</Text>
          </View>
        </View>

        {!open && (
          <View style={styles.closedBanner}>
            <Ionicons name="time" size={16} color={colors.navy[700]} />
            <Text style={styles.closedBannerText}>
              Outside delivery hours — view menu, order when they reopen.
            </Text>
          </View>
        )}

        {sections.map(({ cat, items }) =>
          items.length === 0 ? null : (
            <View key={cat.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{cat.name}</Text>
              {items.map((item) => {
                const price = customerPrice(item, restaurant.markupPct);
                const qty = inCart(item.id);
                return (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.description && (
                        <Text style={styles.itemDesc}>{item.description}</Text>
                      )}
                      <Text style={styles.itemPrice}>{formatUSD(price)}</Text>
                    </View>
                    {qty > 0 ? (
                      <View style={styles.qtyControl}>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => cart.setQty(item.id, qty - 1)}
                        >
                          <Ionicons name="remove" size={16} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => cart.setQty(item.id, qty + 1)}
                        >
                          <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          !open && styles.addButtonDisabled,
                        ]}
                        onPress={() => handleAdd(item)}
                        disabled={!open}
                      >
                        <Ionicons name="add" size={18} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {cart.count > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Cart")}
        >
          <View style={styles.cartCountChip}>
            <Text style={styles.cartCountText}>{cart.count}</Text>
          </View>
          <Text style={styles.cartBarText}>View cart</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { paddingBottom: 24 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.navy[400] },
  hero: {
    backgroundColor: "#fff",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: colors.sand[200],
  },
  heroAccent: { height: 3 },
  heroBody: { padding: 22 },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  heroLeft: { flex: 1, marginRight: 12 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.navy[900],
  },
  heroDesc: {
    fontSize: 14,
    color: colors.navy[600],
    lineHeight: 20,
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
  closedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.gold[100],
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closedBannerText: {
    color: colors.navy[700],
    fontSize: 13,
    flex: 1,
  },
  section: {
    marginTop: 22,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand[200],
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.navy[900],
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.sand[100],
  },
  itemName: { fontSize: 15, fontWeight: "700", color: colors.navy[900] },
  itemDesc: {
    fontSize: 13,
    color: colors.navy[500],
    marginTop: 2,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.coral[500],
    marginTop: 6,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.coral[500],
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: { backgroundColor: colors.navy[300] },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.coral[500],
    borderRadius: 18,
    paddingHorizontal: 4,
    height: 36,
    gap: 4,
  },
  qtyButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    minWidth: 18,
    textAlign: "center",
  },
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
