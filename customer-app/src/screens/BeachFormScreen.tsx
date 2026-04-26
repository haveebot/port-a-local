import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { apiUrl } from "../lib/config";
import { loadSession } from "../lib/auth";
import FormField from "../components/FormField";
import DateField from "../components/DateField";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "BeachForm">;

interface Product {
  value: string;
  label: string;
  description: string;
  price: number;
  icon: string;
}

const PRODUCTS: Product[] = [
  {
    value: "chairs",
    label: "Chair & Umbrella Setup",
    description: "Two chairs and a beach umbrella, set up and ready to go.",
    price: 85,
    icon: "umbrella",
  },
  {
    value: "cabana",
    label: "Cabana Setup",
    description: "Full beach cabana — shade, comfort, the works.",
    price: 300,
    icon: "home",
  },
];

function todayMin(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayDiff(pickup: string, returnD: string): number | null {
  if (!pickup || !returnD) return null;
  const a = new Date(pickup).getTime();
  const b = new Date(returnD).getTime();
  if (b < a) return null;
  // Beach inclusive: same-day rental = 1 day
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

export default function BeachFormScreen({ navigation }: Props) {
  const minDate = useMemo(() => todayMin(), []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState("chairs");
  const [quantity, setQuantity] = useState(1);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selected = PRODUCTS.find((p) => p.value === product) ?? PRODUCTS[0];
  const numDays = dayDiff(pickupDate, returnDate);
  const totalPrice =
    numDays !== null ? selected.price * numDays * quantity : null;

  useEffect(() => {
    navigation.setOptions({ title: "Beach Gear Delivery" });
    (async () => {
      const session = await loadSession();
      if (session?.email && !email) setEmail(session.email);
      if (session?.displayName && !name) setName(session.displayName);
    })();
  }, [navigation]);

  const submit = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert("Missing info", "Name, phone, and email are required.");
      return;
    }
    if (!pickupDate || !returnDate || !numDays) {
      Alert.alert(
        "Pick your dates",
        "Choose a delivery date and an end date to continue."
      );
      return;
    }
    if (!deliveryAddress.trim()) {
      Alert.alert(
        "Where to?",
        "Tell us where to deliver — beach house, condo, etc."
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/checkout/beach"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          product,
          quantity,
          qty: quantity,
          pickupDate,
          returnDate,
          deliveryAddress: deliveryAddress.trim(),
          numDays,
          totalPrice,
          smsConsent,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert(
          "Couldn't start checkout",
          (json as { error?: string }).error ?? "Try again."
        );
        setSubmitting(false);
        return;
      }
      const { url, sessionId } = json as {
        url?: string;
        sessionId?: string;
      };
      if (!url) {
        Alert.alert("Stripe URL missing", "Try again in a moment.");
        setSubmitting(false);
        return;
      }
      navigation.replace("PayWeb", {
        url,
        orderId: sessionId ?? `beach-${Date.now()}`,
      });
    } catch {
      Alert.alert(
        "Connection problem",
        "We couldn't reach the server. Try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>BEACH GEAR</Text>
          <Text style={styles.title}>Chairs, umbrellas,{"\n"}delivered.</Text>
          <View style={styles.line} />
          <Text style={styles.sub}>
            Set up before you arrive, broken down after you leave. Just walk
            up.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHAT YOU NEED</Text>
          <View style={{ gap: 10 }}>
            {PRODUCTS.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.productRow,
                  product === p.value && styles.productRowActive,
                ]}
                onPress={() => setProduct(p.value)}
              >
                <View
                  style={[
                    styles.productIcon,
                    product === p.value && styles.productIconActive,
                  ]}
                >
                  <Ionicons
                    name={p.icon as never}
                    size={22}
                    color={
                      product === p.value
                        ? "#fff"
                        : colors.navy[600]
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productLabel}>{p.label}</Text>
                  <Text style={styles.productDesc}>{p.description}</Text>
                </View>
                <Text style={styles.productPrice}>${p.price}/day</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Quantity</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.min(10, quantity + 1))}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHEN</Text>
          <DateField
            label="Delivery date"
            value={pickupDate}
            onChange={setPickupDate}
            minDate={minDate}
          />
          <DateField
            label="End date"
            value={returnDate}
            onChange={setReturnDate}
            minDate={minDate}
          />
          {totalPrice !== null && (
            <View style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {numDays} day{numDays !== 1 ? "s" : ""} · {quantity}×{" "}
                  {selected.label}
                </Text>
                <Text style={styles.totalValue}>${totalPrice}</Text>
              </View>
              <Text style={styles.totalNote}>
                Delivery, set-up, and pickup included.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHERE</Text>
          <FormField
            label="Delivery address"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Beach house name, condo number, beach access #"
            multiline
            autoComplete="street-address"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR INFO</Text>
          <FormField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            autoCapitalize="words"
            autoComplete="name"
          />
          <FormField
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="(361) 555-0123"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <View style={styles.consentRow}>
            <Switch
              value={smsConsent}
              onValueChange={setSmsConsent}
              trackColor={{ false: colors.sand[200], true: colors.coral[400] }}
              thumbColor={smsConsent ? colors.coral[600] : "#fff"}
            />
            <Text style={styles.consentText}>
              Text me when the gear is set up at your spot
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={submit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {totalPrice !== null ? `Book · $${totalPrice}` : "Book"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Stripe handles the booking. Set-up crew shows up the morning of your
          delivery date.
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.sand[50] },
  content: {},
  hero: {
    backgroundColor: colors.navy[950],
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  eyebrow: {
    color: colors.sunset[400],
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: colors.sand[50],
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
  },
  line: {
    height: 1,
    width: 56,
    backgroundColor: colors.sunset[500],
    marginVertical: 14,
  },
  sub: {
    color: colors.navy[200],
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "300",
  },
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
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.sand[200],
    backgroundColor: colors.sand[50],
    gap: 12,
  },
  productRowActive: {
    borderColor: colors.coral[500],
    backgroundColor: colors.coral[50],
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.sand[100],
    alignItems: "center",
    justifyContent: "center",
  },
  productIconActive: { backgroundColor: colors.coral[500] },
  productLabel: { fontSize: 14, fontWeight: "700", color: colors.navy[800] },
  productDesc: { fontSize: 12, color: colors.navy[500], marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: "700", color: colors.coral[600] },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.navy[700],
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.coral[500],
    borderRadius: 22,
    alignSelf: "flex-start",
    height: 40,
    paddingHorizontal: 4,
  },
  qtyButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
    minWidth: 28,
    textAlign: "center",
  },
  totalCard: {
    backgroundColor: colors.coral[50],
    padding: 14,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.coral[200],
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy[900],
    flex: 1,
    marginRight: 8,
  },
  totalValue: { fontSize: 18, fontWeight: "800", color: colors.coral[600] },
  totalNote: { fontSize: 12, color: colors.navy[500] },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  consentText: { fontSize: 13, color: colors.navy[700], flex: 1 },
  submitButton: {
    marginHorizontal: 16,
    marginTop: 22,
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
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  disclaimer: {
    fontSize: 12,
    color: colors.navy[400],
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 24,
  },
});
