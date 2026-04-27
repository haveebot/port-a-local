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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { apiUrl } from "../lib/config";
import { loadSession } from "../lib/auth";
import FormField from "../components/FormField";
import DateField from "../components/DateField";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "RentForm">;

const CART_SIZES = [
  { value: "4", label: "4-Passenger", desc: "2 adults + 2 kids" },
  { value: "6", label: "6-Passenger", desc: "Family of six" },
  { value: "8", label: "8-Passenger", desc: "Group / multi-fam" },
];

const RESERVATION_FEE_PER_DAY = 10;

function getMinDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayDiff(pickup: string, returnD: string): number | null {
  if (!pickup || !returnD) return null;
  const a = new Date(pickup).getTime();
  const b = new Date(returnD).getTime();
  if (b <= a) return null;
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export default function RentFormScreen({ navigation }: Props) {
  const minDate = useMemo(() => getMinDate(), []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cartSize, setCartSize] = useState("4");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const numDays = dayDiff(pickupDate, returnDate);
  const reservationFee = numDays ? numDays * RESERVATION_FEE_PER_DAY : null;

  useEffect(() => {
    navigation.setOptions({ title: "Reserve Golf Cart" });
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
    if (!pickupDate || !returnDate) {
      Alert.alert(
        "Pick your dates",
        "Choose both a pickup and return date to continue."
      );
      return;
    }
    if (!numDays) {
      Alert.alert("Date order", "Return date must be after pickup date.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/checkout/rent"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          cartSize,
          pickupDate,
          returnDate,
          numDays,
          reservationFee,
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
        orderId: sessionId ?? `rent-${Date.now()}`,
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
          <Text style={styles.eyebrow}>GOLF CART RENTAL</Text>
          <Text style={styles.title}>Get around the island,{"\n"}your way.</Text>
          <View style={styles.line} />
          <Text style={styles.sub}>
            ${RESERVATION_FEE_PER_DAY}/day reservation fee. Vendor handles the
            rest at pickup.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CART SIZE</Text>
          <View style={styles.sizeCol}>
            {CART_SIZES.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.sizeRow,
                  cartSize === opt.value && styles.sizeRowActive,
                ]}
                onPress={() => setCartSize(opt.value)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.sizeLabel,
                      cartSize === opt.value && styles.sizeLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={styles.sizeDesc}>{opt.desc}</Text>
                </View>
                {cartSize === opt.value && (
                  <View style={styles.sizeCheck} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATES</Text>
          <DateField
            label="Pickup date"
            value={pickupDate}
            onChange={setPickupDate}
            minDate={minDate}
            hint="Earliest pickup is 5 days from today (vendor lead time)."
          />
          <DateField
            label="Return date"
            value={returnDate}
            onChange={setReturnDate}
            minDate={minDate}
          />
          {numDays !== null && reservationFee !== null && (
            <View style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{numDays}-day rental</Text>
                <Text style={styles.totalValue}>
                  ${numDays * RESERVATION_FEE_PER_DAY}
                </Text>
              </View>
              <Text style={styles.totalNote}>
                Reservation fee only — vendor collects the cart rental at
                pickup.
              </Text>
            </View>
          )}
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
              Text me with vendor details and pickup info
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
              {reservationFee !== null
                ? `Reserve · $${reservationFee}`
                : "Reserve Cart"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Stripe handles the reservation fee. Cart rental is paid to the vendor
          at pickup.
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
    color: colors.ocean[400],
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
    backgroundColor: colors.ocean[500],
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
  sizeCol: { gap: 10 },
  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.sand[200],
    backgroundColor: colors.sand[50],
  },
  sizeRowActive: {
    borderColor: colors.coral[500],
    backgroundColor: colors.coral[50],
  },
  sizeLabel: { fontSize: 15, fontWeight: "700", color: colors.navy[800] },
  sizeLabelActive: { color: colors.coral[600] },
  sizeDesc: { fontSize: 12, color: colors.navy[400], marginTop: 2 },
  sizeCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.coral[500],
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
  },
  totalLabel: { fontSize: 15, fontWeight: "700", color: colors.navy[900] },
  totalValue: { fontSize: 18, fontWeight: "800", color: colors.coral[600] },
  totalNote: { fontSize: 12, color: colors.navy[500] },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
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
