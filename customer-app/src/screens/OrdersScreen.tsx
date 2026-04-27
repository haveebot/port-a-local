import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../lib/theme";
import { loadSession } from "../lib/auth";
import {
  fetchMyOrders,
  formatUSD,
  isTerminal,
  statusLabel,
  type CustomerOrder,
  type OrderStatus,
} from "../lib/orders";
import { AccountStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<AccountStackParamList, "Orders">;

function statusColor(s: OrderStatus): string {
  if (s === "delivered") return colors.seafoam[500];
  if (s === "canceled" || s === "refunded") return colors.navy[400];
  return colors.coral[500];
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function OrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const load = useCallback(async () => {
    const session = await loadSession();
    if (!session?.email) {
      setSignedIn(false);
      setOrders([]);
      setLoading(false);
      return;
    }
    setSignedIn(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch {
      // silent — leave previous state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: "My Orders" });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color={colors.coral[500]} />
      </View>
    );
  }

  if (!signedIn) {
    return (
      <View style={styles.empty}>
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={colors.navy[300]}
        />
        <Text style={styles.emptyTitle}>Sign in to see orders</Text>
        <Text style={styles.emptyText}>
          We&apos;ll match orders to the email on your Apple sign-in.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.coral[500]}
        />
      }
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={48} color={colors.navy[300]} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>
            When you order something through Port A Local, it shows up here.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("OrderDetail", { orderId: item.id })
          }
        >
          <View style={styles.row}>
            <Text style={styles.restaurant}>{item.restaurantName}</Text>
            <Text style={styles.total}>{formatUSD(item.totalCents)}</Text>
          </View>
          <Text style={styles.meta}>
            {item.itemCount} item{item.itemCount === 1 ? "" : "s"} ·{" "}
            {formatRelative(item.placedAt)}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusColor(item.status) },
                isTerminal(item.status) && { opacity: 0.7 },
              ]}
            />
            <Text
              style={[styles.statusText, { color: statusColor(item.status) }]}
            >
              {statusLabel(item.status)}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.sand[50] },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.sand[200],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  restaurant: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy[900],
    flex: 1,
    marginRight: 8,
  },
  total: { fontSize: 16, fontWeight: "800", color: colors.coral[600] },
  meta: { fontSize: 12, color: colors.navy[400], marginBottom: 8 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "600" },
  empty: {
    flex: 1,
    backgroundColor: colors.sand[50],
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
    minHeight: 320,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.navy[900] },
  emptyText: {
    fontSize: 14,
    color: colors.navy[400],
    textAlign: "center",
    lineHeight: 20,
  },
});
