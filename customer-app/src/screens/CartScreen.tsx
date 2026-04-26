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
  getMenuItem,
  getRestaurantById,
  customerPrice,
} from "@palocal/data/delivery-restaurants";
import { formatUSD } from "@palocal/data/delivery-pricing";
import { colors } from "../lib/theme";
import { useCart } from "../lib/cart";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "Cart">;

export default function CartScreen({ navigation }: Props) {
  const cart = useCart();
  const restaurant = cart.restaurantId
    ? getRestaurantById(cart.restaurantId)
    : null;

  // Subtotal preview (no tip yet — added at checkout).
  const priced = useMemo(() => cart.priced(0), [cart]);

  if (cart.lines.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons
          name="bag-outline"
          size={48}
          color={colors.navy[300]}
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.emptyTitle}>Cart is empty</Text>
        <Text style={styles.emptyText}>
          Pick a restaurant and add a few items.
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate("DeliverHome")}
        >
          <Text style={styles.browseButtonText}>Browse restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {restaurant && (
          <View style={styles.restaurantBlock}>
            <Text style={styles.eyebrow}>FROM</Text>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.pickupAddress}>{restaurant.pickupAddress}</Text>
          </View>
        )}

        <View style={styles.itemsCard}>
          {cart.lines.map((line, idx) => {
            const item = getMenuItem(line.itemId);
            if (!item || !restaurant) return null;
            const unit = customerPrice(item, restaurant.markupPct);
            const lineTotal = unit * line.quantity;
            return (
              <View key={line.itemId}>
                {idx > 0 && <View style={styles.divider} />}
                <View style={styles.itemRow}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemUnit}>
                      {formatUSD(unit)} each
                    </Text>
                  </View>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => cart.setQty(line.itemId, line.quantity - 1)}
                    >
                      <Ionicons name="remove" size={16} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{line.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => cart.setQty(line.itemId, line.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.lineTotal}>{formatUSD(lineTotal)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {priced && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatUSD(priced.subtotalCents)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>
                {formatUSD(priced.deliveryFeeCents)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service</Text>
              <Text style={styles.summaryValue}>
                {formatUSD(priced.serviceFeeCents)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>
                {formatUSD(priced.taxCents)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Subtotal before tip</Text>
              <Text style={styles.totalValue}>
                {formatUSD(priced.totalCents)}
              </Text>
            </View>
            <Text style={styles.tipHint}>Add a tip at checkout.</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => cart.clear()}
        >
          <Text style={styles.clearButtonText}>Empty cart</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.checkoutBar}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Checkout")}
      >
        <Text style={styles.checkoutText}>Checkout</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: 16, paddingBottom: 40 },
  empty: {
    flex: 1,
    backgroundColor: colors.sand[50],
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: colors.navy[400],
    marginBottom: 20,
    textAlign: "center",
  },
  browseButton: {
    backgroundColor: colors.coral[500],
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  restaurantBlock: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.sand[200],
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 2,
  },
  pickupAddress: { fontSize: 13, color: colors.navy[500] },
  itemsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sand[200],
    overflow: "hidden",
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  itemName: { fontSize: 15, fontWeight: "700", color: colors.navy[900] },
  itemUnit: { fontSize: 12, color: colors.navy[400], marginTop: 2 },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.coral[500],
    borderRadius: 16,
    height: 32,
    paddingHorizontal: 4,
    gap: 2,
  },
  qtyButton: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    minWidth: 18,
    textAlign: "center",
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy[900],
    marginLeft: 12,
    minWidth: 60,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: colors.sand[100],
    marginHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.sand[200],
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 14, color: colors.navy[500] },
  summaryValue: { fontSize: 14, color: colors.navy[800], fontWeight: "600" },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy[900],
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.navy[900],
  },
  tipHint: {
    fontSize: 12,
    color: colors.navy[400],
    marginTop: 6,
    textAlign: "right",
  },
  clearButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  clearButtonText: { color: colors.coral[600], fontWeight: "600", fontSize: 13 },
  checkoutBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: colors.navy[950],
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.navy[950],
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  checkoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
