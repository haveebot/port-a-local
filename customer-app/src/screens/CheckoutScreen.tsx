import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  formatUSD,
  TIP_PRESETS_PCT,
} from "@palocal/data/delivery-pricing";
import { getRestaurantById } from "@palocal/data/delivery-restaurants";
import { colors } from "../lib/theme";
import { useCart } from "../lib/cart";
import { apiUrl } from "../lib/config";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "Checkout">;

// Matches the actual /api/deliver/order responses:
//   live mode → { orderId, checkoutUrl, total }
//   beta mode → { orderId, beta: true, redirectUrl }
interface OrderResponse {
  orderId: string;
  checkoutUrl?: string;
  beta?: boolean;
  redirectUrl?: string;
  total?: string;
}

export default function CheckoutScreen({ navigation }: Props) {
  const cart = useCart();
  const restaurant = cart.restaurantId
    ? getRestaurantById(cart.restaurantId)
    : null;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [tipPct, setTipPct] = useState<number | "custom">(20);
  const [customTip, setCustomTip] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(() => {
    const p = cart.priced(0);
    return p?.subtotalCents ?? 0;
  }, [cart]);

  const tipCents = useMemo(() => {
    if (tipPct === "custom") {
      const dollars = parseFloat(customTip || "0");
      return Number.isFinite(dollars) ? Math.round(dollars * 100) : 0;
    }
    return Math.round(subtotal * (tipPct / 100));
  }, [tipPct, customTip, subtotal]);

  const priced = useMemo(() => cart.priced(tipCents), [cart, tipCents]);

  const submit = async () => {
    if (!restaurant) return;
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert(
        "Missing info",
        "Name, phone, and delivery address are required."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/deliver/order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant.slug,
          items: cart.lines,
          customer: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            deliveryAddress: address.trim(),
            deliveryNotes: notes.trim() || undefined,
          },
          tipCents,
        }),
      });
      const json = (await res.json()) as
        | OrderResponse
        | { error: string };
      if (!res.ok || "error" in json) {
        const msg =
          "error" in json ? json.error : "Could not place order. Try again.";
        Alert.alert("Order failed", msg);
        setSubmitting(false);
        return;
      }
      // Branch on what the API actually returns:
      //   live mode: checkoutUrl is set → must open Stripe before clearing
      //   beta mode: beta=true / redirectUrl set → request-only, no charge
      if (json.checkoutUrl) {
        cart.clear();
        navigation.replace("PayWeb", {
          url: json.checkoutUrl,
          orderId: json.orderId,
        });
      } else if (json.beta) {
        cart.clear();
        navigation.replace("OrderSuccess", { orderId: json.orderId });
      } else {
        // Unexpected: server didn't give us a checkout URL and didn't flag
        // beta. Don't pretend the order succeeded — keep the cart and
        // prompt to retry.
        Alert.alert(
          "Order didn't go through",
          "The server didn't return a payment link. Try again in a moment."
        );
        setSubmitting(false);
        return;
      }
    } catch {
      Alert.alert(
        "Connection problem",
        "We couldn't reach the server. Check your connection and try again."
      );
      setSubmitting(false);
    }
  };

  if (!restaurant || !priced) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Cart is empty.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR INFO</Text>
          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            autoCapitalize="words"
            autoComplete="name"
          />
          <Field
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="(361) 555-0123"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <Field
            label="Email (optional)"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DELIVER TO</Text>
          <Field
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Beach house, condo number, etc."
            multiline
            autoComplete="street-address"
          />
          <Field
            label="Notes for the runner (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Gate code, leave on porch, etc."
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TIP YOUR RUNNER</Text>
          <View style={styles.tipRow}>
            {TIP_PRESETS_PCT.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.tipChip,
                  tipPct === p && styles.tipChipActive,
                ]}
                onPress={() => setTipPct(p)}
              >
                <Text
                  style={[
                    styles.tipChipText,
                    tipPct === p && styles.tipChipTextActive,
                  ]}
                >
                  {p}%
                </Text>
                <Text
                  style={[
                    styles.tipChipAmount,
                    tipPct === p && styles.tipChipTextActive,
                  ]}
                >
                  {formatUSD(Math.round(subtotal * (p / 100)))}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.tipChip,
                tipPct === "custom" && styles.tipChipActive,
              ]}
              onPress={() => setTipPct("custom")}
            >
              <Text
                style={[
                  styles.tipChipText,
                  tipPct === "custom" && styles.tipChipTextActive,
                ]}
              >
                Custom
              </Text>
              {tipPct === "custom" && (
                <TextInput
                  style={styles.customTipInput}
                  value={customTip}
                  onChangeText={setCustomTip}
                  placeholder="$"
                  placeholderTextColor={colors.navy[200]}
                  keyboardType="decimal-pad"
                />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.tipNote}>100% of tips go to your runner.</Text>
        </View>

        <View style={styles.summaryCard}>
          <Row label="Subtotal" value={formatUSD(priced.subtotalCents)} />
          <Row label="Delivery" value={formatUSD(priced.deliveryFeeCents)} />
          <Row label="Service" value={formatUSD(priced.serviceFeeCents)} />
          <Row label="Tax" value={formatUSD(priced.taxCents)} />
          <Row label="Tip" value={formatUSD(priced.tipCents)} />
          <View style={styles.divider} />
          <Row
            label="Total"
            value={formatUSD(priced.totalCents)}
            big
          />
        </View>

        <TouchableOpacity
          style={[styles.payButton, submitting && styles.payButtonDisabled]}
          onPress={submit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay {formatUSD(priced.totalCents)}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Payment is processed securely by Stripe. You&apos;ll be sent to a
          Stripe Checkout page to complete your order.
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  autoComplete?: string;
  multiline?: boolean;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoComplete,
  multiline,
}: FieldProps) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.navy[300]}
        style={[fieldStyles.input, multiline && fieldStyles.inputMulti]}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete as never}
        multiline={multiline}
      />
    </View>
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
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, big && styles.summaryLabelBig]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, big && styles.summaryValueBig]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.sand[50] },
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.navy[400] },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.sand[200],
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  tipRow: { flexDirection: "row", gap: 8 },
  tipChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.sand[200],
    alignItems: "center",
    backgroundColor: colors.sand[50],
  },
  tipChipActive: {
    borderColor: colors.coral[500],
    backgroundColor: colors.coral[50],
  },
  tipChipText: { fontWeight: "700", color: colors.navy[500], fontSize: 14 },
  tipChipAmount: {
    fontSize: 11,
    color: colors.navy[400],
    marginTop: 2,
  },
  tipChipTextActive: { color: colors.coral[600] },
  customTipInput: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    minWidth: 50,
    textAlign: "center",
    fontWeight: "700",
    color: colors.coral[600],
  },
  tipNote: { fontSize: 12, color: colors.navy[400], marginTop: 8 },
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
  summaryLabelBig: {
    fontSize: 16,
    color: colors.navy[900],
    fontWeight: "700",
  },
  summaryValueBig: {
    fontSize: 18,
    color: colors.navy[900],
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: colors.sand[200],
    marginVertical: 6,
  },
  payButton: {
    backgroundColor: colors.coral[500],
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: colors.coral[600],
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: "#fff", fontWeight: "800", fontSize: 17 },
  disclaimer: {
    fontSize: 11,
    color: colors.navy[400],
    textAlign: "center",
    marginTop: 12,
    lineHeight: 16,
  },
});

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.navy[700],
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.sand[50],
    borderWidth: 1,
    borderColor: colors.sand[200],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.navy[900],
  },
  inputMulti: { minHeight: 60, textAlignVertical: "top" },
});
