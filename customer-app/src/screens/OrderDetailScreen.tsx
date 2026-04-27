import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../lib/theme";
import {
  fetchMyOrder,
  formatUSD,
  isTerminal,
  statusLabel,
  type CustomerOrder,
  type OrderStatus,
} from "../lib/orders";
import { AccountStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<AccountStackParamList, "OrderDetail">;

const TIMELINE: Array<{
  status: OrderStatus;
  icon: string;
  color: string;
  fallback: string;
}> = [
  {
    status: "placed",
    icon: "checkmark-circle",
    color: "#10b981",
    fallback: "Order received",
  },
  {
    status: "paid",
    icon: "card",
    color: "#10b981",
    fallback: "Payment confirmed",
  },
  {
    status: "claimed",
    icon: "hand-right",
    color: "#d4a843",
    fallback: "Runner claimed",
  },
  {
    status: "picked_up",
    icon: "fast-food",
    color: "#e8656f",
    fallback: "Picked up",
  },
  {
    status: "delivered",
    icon: "home",
    color: "#0b1120",
    fallback: "Delivered",
  },
];

const POLL_INTERVAL_MS = 15_000;

export default function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const o = await fetchMyOrder(orderId);
      setOrder(o);
    } catch {
      // leave previous state
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    navigation.setOptions({ title: "Order" });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      load();

      // Poll every POLL_INTERVAL_MS while the order is still moving;
      // stop when terminal so we don't burn battery on Delivered orders.
      const start = () => {
        if (pollTimer.current) return;
        pollTimer.current = setInterval(load, POLL_INTERVAL_MS);
      };
      const stop = () => {
        if (pollTimer.current) {
          clearInterval(pollTimer.current);
          pollTimer.current = null;
        }
      };
      start();
      return stop;
    }, [load])
  );

  // If a status update arrives that is terminal, kill the timer.
  useEffect(() => {
    if (order && isTerminal(order.status) && pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, [order]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator color={colors.coral[500]} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loaderWrap}>
        <Ionicons
          name="alert-circle-outline"
          size={36}
          color={colors.navy[300]}
        />
        <Text style={styles.errorText}>
          Order not found. It may have been canceled or belong to another
          account.
        </Text>
      </View>
    );
  }

  const currentIndex = TIMELINE.findIndex((s) => s.status === order.status);
  const reachedIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.coral[500]}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{order.restaurantName.toUpperCase()}</Text>
        <Text style={styles.title}>{statusLabel(order.status)}</Text>
        <View style={styles.coralLine} />
        <Text style={styles.sub}>
          Order #{order.id.slice(0, 8)} · {formatUSD(order.totalCents)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>STATUS</Text>
        <View style={styles.timeline}>
          {TIMELINE.map((step, i) => {
            const done = i <= reachedIndex && order.status !== "canceled";
            return (
              <View key={step.status} style={styles.tlRow}>
                <View style={styles.tlCol}>
                  <View
                    style={[
                      styles.tlDot,
                      { backgroundColor: done ? step.color : colors.sand[200] },
                    ]}
                  >
                    <Ionicons
                      name={step.icon as never}
                      size={14}
                      color={done ? "#fff" : colors.navy[400]}
                    />
                  </View>
                  {i < TIMELINE.length - 1 && (
                    <View style={styles.tlLine} />
                  )}
                </View>
                <Text style={[styles.tlLabel, done && styles.tlLabelDone]}>
                  {step.fallback}
                </Text>
              </View>
            );
          })}
        </View>

        {!isTerminal(order.status) && (
          <Text style={styles.pollNote}>
            <Ionicons name="sync" size={11} /> Live — refreshes every 15s.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ITEMS</Text>
        {order.items.map((line, idx) => (
          <View key={idx} style={styles.lineRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lineName}>
                {line.quantity}× {line.itemName}
              </Text>
              {line.notes && (
                <Text style={styles.lineNotes}>{line.notes}</Text>
              )}
            </View>
            <Text style={styles.linePrice}>
              {formatUSD(line.customerPriceCents * line.quantity)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>TOTAL</Text>
        <Row label="Subtotal" value={formatUSD(order.subtotalCents)} />
        <Row label="Delivery" value={formatUSD(order.deliveryFeeCents)} />
        <Row label="Service" value={formatUSD(order.serviceFeeCents)} />
        <Row label="Tax" value={formatUSD(order.taxCents)} />
        <Row label="Tip" value={formatUSD(order.tipCents)} />
        <View style={styles.divider} />
        <Row label="Total" value={formatUSD(order.totalCents)} big />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DELIVERED TO</Text>
        <Text style={styles.body}>{order.customer.name}</Text>
        <Text style={styles.body}>{order.customer.deliveryAddress}</Text>
        {order.customer.deliveryNotes && (
          <Text style={styles.bodyNote}>{order.customer.deliveryNotes}</Text>
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function Row({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, big && styles.rowLabelBig]}>{label}</Text>
      <Text style={[styles.rowValue, big && styles.rowValueBig]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { paddingBottom: 24 },
  loaderWrap: {
    flex: 1,
    backgroundColor: colors.sand[50],
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.navy[400],
    textAlign: "center",
    lineHeight: 20,
  },
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
    fontSize: 24,
    fontWeight: "800",
  },
  coralLine: {
    height: 1,
    width: 56,
    backgroundColor: colors.coral[500],
    marginVertical: 14,
  },
  sub: { color: colors.navy[200], fontSize: 13, fontWeight: "300" },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sand[200],
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 1.6,
    marginBottom: 12,
  },
  timeline: { gap: 0 },
  tlRow: { flexDirection: "row", alignItems: "flex-start" },
  tlCol: { alignItems: "center", marginRight: 14 },
  tlDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tlLine: {
    width: 2,
    minHeight: 22,
    backgroundColor: colors.sand[200],
    marginVertical: 2,
  },
  tlLabel: {
    fontSize: 14,
    color: colors.navy[400],
    paddingTop: 6,
    flex: 1,
  },
  tlLabelDone: { color: colors.navy[900], fontWeight: "600" },
  pollNote: {
    marginTop: 12,
    fontSize: 11,
    color: colors.seafoam[600],
    fontStyle: "italic",
  },
  lineRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand[100],
  },
  lineName: { fontSize: 14, fontWeight: "600", color: colors.navy[900] },
  lineNotes: { fontSize: 12, color: colors.navy[500], marginTop: 2 },
  linePrice: { fontSize: 14, fontWeight: "700", color: colors.navy[900] },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 14, color: colors.navy[500] },
  rowValue: { fontSize: 14, color: colors.navy[800], fontWeight: "600" },
  rowLabelBig: { fontSize: 16, fontWeight: "700", color: colors.navy[900] },
  rowValueBig: { fontSize: 18, fontWeight: "800", color: colors.navy[900] },
  divider: {
    height: 1,
    backgroundColor: colors.sand[200],
    marginVertical: 6,
  },
  body: { fontSize: 14, color: colors.navy[700], marginBottom: 4 },
  bodyNote: {
    fontSize: 13,
    color: colors.navy[500],
    fontStyle: "italic",
    marginTop: 4,
  },
});
