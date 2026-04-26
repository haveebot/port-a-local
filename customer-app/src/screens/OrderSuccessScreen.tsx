import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "OrderSuccess">;

export default function OrderSuccessScreen({ route, navigation }: Props) {
  const { orderId } = route.params;

  React.useEffect(() => {
    navigation.setOptions({
      title: "Order Placed",
      headerBackVisible: false,
    });
  }, [navigation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
      </View>

      <Text style={styles.eyebrow}>YOU&apos;RE ALL SET</Text>
      <Text style={styles.title}>Order placed.</Text>
      <View style={styles.coralLine} />
      <Text style={styles.sub}>
        A local runner is being dispatched. You&apos;ll get a text when your
        food is on the way and another when it arrives.
      </Text>

      <View style={styles.orderCard}>
        <Text style={styles.orderLabel}>Order ID</Text>
        <Text style={styles.orderId}>{orderId}</Text>
      </View>

      <View style={styles.timeline}>
        <TimelineRow
          icon="checkmark-circle"
          color={colors.seafoam[500]}
          label="Order received"
          done
        />
        <TimelineRow
          icon="restaurant"
          color={colors.gold[500]}
          label="Runner picking up your food"
        />
        <TimelineRow
          icon="bicycle"
          color={colors.coral[500]}
          label="On the way to you"
        />
        <TimelineRow
          icon="home"
          color={colors.navy[700]}
          label="Delivered"
          last
        />
      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.popToTop()}
        activeOpacity={0.85}
      >
        <Text style={styles.doneButtonText}>Back to delivery</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function TimelineRow({
  icon,
  color,
  label,
  done,
  last,
}: {
  icon: string;
  color: string;
  label: string;
  done?: boolean;
  last?: boolean;
}) {
  return (
    <View style={timelineStyles.row}>
      <View style={timelineStyles.iconCol}>
        <View
          style={[
            timelineStyles.dot,
            { backgroundColor: done ? color : colors.sand[200] },
          ]}
        >
          <Ionicons
            name={icon as never}
            size={14}
            color={done ? "#fff" : colors.navy[400]}
          />
        </View>
        {!last && <View style={timelineStyles.line} />}
      </View>
      <Text
        style={[
          timelineStyles.label,
          done && timelineStyles.labelDone,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: 20, alignItems: "center", paddingTop: 40 },
  iconWrap: { marginBottom: 24 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.seafoam[500],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.seafoam[600],
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.navy[900],
    marginBottom: 4,
  },
  coralLine: {
    height: 1,
    width: 56,
    backgroundColor: colors.coral[500],
    marginVertical: 14,
  },
  sub: {
    fontSize: 15,
    color: colors.navy[500],
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.sand[200],
    alignItems: "center",
    minWidth: "70%",
    marginBottom: 28,
  },
  orderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy[400],
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy[900],
    fontFamily: "Menlo",
  },
  timeline: { width: "100%", marginBottom: 28 },
  doneButton: {
    backgroundColor: colors.navy[950],
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
  },
  doneButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

const timelineStyles = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 4 },
  iconCol: { alignItems: "center", marginRight: 14 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: 2,
    height: 30,
    backgroundColor: colors.sand[200],
    marginVertical: 2,
  },
  label: {
    fontSize: 14,
    color: colors.navy[400],
    paddingTop: 6,
    flex: 1,
  },
  labelDone: { color: colors.navy[900], fontWeight: "600" },
});
