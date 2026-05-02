import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
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
import ErrorBanner from "../components/ErrorBanner"; // Assuming path to ErrorBanner

type Props = NativeStackScreenProps<AccountStackParamList, "Orders">;

function statusColor(s: OrderStatus): string {
  if (s === "delivered") return colors.seafoam[500];
  if (s === "canceled" || s === "refunded") return colors.navy[400];
  return colors.coral[500];
}

/** Bone-colored placeholder card shown while orders are loading. */
function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={styles.row}>
        <View style={[styles.skeletonBar, { width: "55%", height: 16 }]} />
        <View style={[styles.skeletonBar, { width: 60, height: 16 }]} />
      </View>
      <View style={[styles.skeletonBar, { width: "40%", height: 11, marginTop: 8 }]} />
      <View style={styles.statusRow}>
        <View style={[styles.skeletonBar, { width: 8, height: 8, borderRadius: 4 }]} />
        <View style={[styles.skeletonBar, { width: "35%", height: 12 }]} />
      </View>
    </View>
  );
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
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
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
    } catch (e) {
      // Surface the error so the user can retry instead of staring at
      // a stale list with no signal that the refresh failed.
      const isAbort = e instanceof Error && e.name === "AbortError";
      setError(isAbort ? "Couldn't reach Port A Local. Check your connection." : "Couldn't refresh your orders.");
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
      <View style={styles.list}>
        <View style={styles.listContent}>
          <SkeletonCard />
          <View style={{ height: 10 }} />
          <SkeletonCard />
          <View style={{ height: 10 }} />
          <SkeletonCard />
        </View>
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
      ListHeaderComponent={
        error ? (
          <ErrorBanner message={error} onRetry={onRefresh} variant='inline' />
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={48} color={colors.navy[300]} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>
            When you order something through Port A Local, it shows up here.
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={() => navigation.getParent()?.navigate("Browse")}
            accessibilityRole="button"
          >
            <Text style={styles.emptyCtaText}>Browse Port A</Text>
          </TouchableOpacity>
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
  emptyCta: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.coral[500],
  },
  emptyCtaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  skeletonCard: { borderColor: colors.sand[200] },
  skeletonBar: {
    backgroundColor: colors.sand[200],
    borderRadius: 4,
  },
});
