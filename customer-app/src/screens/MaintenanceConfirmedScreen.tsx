import React, { useEffect } from "react";
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

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  "MaintenanceConfirmed"
>;

export default function MaintenanceConfirmedScreen({ navigation }: Props) {
  useEffect(() => {
    navigation.setOptions({
      title: "Request Sent",
      headerBackVisible: false,
    });
  }, [navigation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="construct" size={44} color="#fff" />
      </View>

      <Text style={styles.eyebrow}>WE'VE GOT IT</Text>
      <Text style={styles.title}>Request sent.</Text>
      <View style={styles.line} />
      <Text style={styles.sub}>
        A local pro is being notified now. They&apos;ll reach out by your
        preferred method to schedule.
      </Text>

      <View style={styles.timeline}>
        <Step icon="checkmark" color={colors.seafoam[500]} label="Request received" done />
        <Step icon="hand-right" color={colors.gold[500]} label="Vendor confirming" />
        <Step icon="construct" color={colors.coral[500]} label="Job scheduled" last />
      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.popToTop()}
        activeOpacity={0.85}
      >
        <Text style={styles.doneButtonText}>Back to Services</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Step({
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
    <View style={stepStyles.row}>
      <View style={stepStyles.col}>
        <View
          style={[
            stepStyles.dot,
            { backgroundColor: done ? color : colors.sand[200] },
          ]}
        >
          <Ionicons
            name={icon as never}
            size={14}
            color={done ? "#fff" : colors.navy[400]}
          />
        </View>
        {!last && <View style={stepStyles.line} />}
      </View>
      <Text style={[stepStyles.label, done && stepStyles.labelDone]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: 22, alignItems: "center", paddingTop: 40 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.gold[500],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: colors.gold[600],
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
  },
  line: {
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
  timeline: { width: "100%", marginBottom: 28 },
  doneButton: {
    backgroundColor: colors.navy[950],
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
  },
  doneButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

const stepStyles = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 4 },
  col: { alignItems: "center", marginRight: 14 },
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
