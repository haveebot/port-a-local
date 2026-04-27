import React, { useEffect, useState } from "react";
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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { apiUrl } from "../lib/config";
import { loadSession } from "../lib/auth";
import FormField from "../components/FormField";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "MaintenanceForm">;

const SERVICE_TYPES = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC / AC" },
  { value: "appliance", label: "Appliance" },
  { value: "general", label: "General Repair" },
  { value: "other", label: "Other" },
];

const URGENCIES = [
  {
    value: "routine",
    label: "Routine",
    sublabel: "Within a week",
    color: colors.navy[600],
  },
  {
    value: "urgent",
    label: "Urgent",
    sublabel: "Within 48 hrs",
    color: colors.gold[600],
  },
  {
    value: "emergency",
    label: "Emergency",
    sublabel: "ASAP",
    color: colors.coral[600],
  },
];

export default function MaintenanceFormScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [serviceType, setServiceType] = useState("plumbing");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [contactPref, setContactPref] = useState<"phone" | "text" | "email">(
    "phone"
  );
  const [smsConsent, setSmsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    navigation.setOptions({ title: "Request Maintenance" });
    (async () => {
      const session = await loadSession();
      if (session?.email && !email) setEmail(session.email);
      if (session?.displayName && !name) setName(session.displayName);
    })();
  }, [navigation]);

  const pickPhoto = async () => {
    if (photos.length >= 4) {
      Alert.alert("Limit reached", "Up to 4 photos per request.");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Photos needed",
        "Allow photo access to attach a picture of the issue."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      // Keep each photo under ~700KB raw so a 4-photo submission stays
      // well under Vercel's 4.5MB request body limit. Server enforces
      // the same cap defensively.
      quality: 0.4,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const asset = result.assets[0];
    if (!asset.base64) return;
    const dataUri = `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`;
    setPhotos((prev) => [...prev, dataUri]);
  };

  const takePhoto = async () => {
    if (photos.length >= 4) {
      Alert.alert("Limit reached", "Up to 4 photos per request.");
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Camera needed",
        "Allow camera access to snap a picture of the issue."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      // Keep each photo under ~700KB raw so a 4-photo submission stays
      // well under Vercel's 4.5MB request body limit. Server enforces
      // the same cap defensively.
      quality: 0.4,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const asset = result.assets[0];
    if (!asset.base64) return;
    const dataUri = `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`;
    setPhotos((prev) => [...prev, dataUri]);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !address.trim() ||
      !description.trim()
    ) {
      Alert.alert(
        "Missing info",
        "Name, phone, email, address, and a description are required."
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/maintenance"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          serviceType,
          description: description.trim(),
          urgency,
          contactPref,
          smsConsent,
          photos,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert(
          "Couldn't send request",
          (json as { error?: string }).error ?? "Try again."
        );
        setSubmitting(false);
        return;
      }
      navigation.replace("MaintenanceConfirmed");
    } catch {
      Alert.alert(
        "Connection problem",
        "We couldn't reach the server. Check your connection and try again."
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
          <Text style={styles.eyebrow}>MAINTENANCE</Text>
          <Text style={styles.title}>What needs fixing?</Text>
          <View style={styles.coralLine} />
          <Text style={styles.sub}>
            Local pros — no-stress dispatch. We text you when a tech is on the
            way.
          </Text>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PROPERTY</Text>
          <FormField
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="123 Beachfront Dr, Port Aransas"
            multiline
            autoComplete="street-address"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHAT'S WRONG</Text>
          <Text style={styles.fieldLabel}>Type of work</Text>
          <View style={styles.chipsWrap}>
            {SERVICE_TYPES.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  serviceType === opt.value && styles.chipActive,
                ]}
                onPress={() => setServiceType(opt.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    serviceType === opt.value && styles.chipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Hot tub jets aren't pushing water. Started yesterday."
            multiline
            hint="The more detail, the faster the dispatch."
            style={{ marginTop: 12 }}
          />

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
            Photos (optional)
          </Text>
          <Text style={styles.photoHint}>
            A picture helps the vendor bring the right parts. Up to 4.
          </Text>

          {photos.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoStrip}
              contentContainerStyle={styles.photoStripContent}
            >
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoWrap}>
                  <Image source={{ uri }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => removePhoto(i)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.photoButtonsRow}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={takePhoto}
              activeOpacity={0.85}
              disabled={photos.length >= 4}
            >
              <Ionicons name="camera" size={18} color={colors.coral[500]} />
              <Text style={styles.photoButtonText}>Take photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={pickPhoto}
              activeOpacity={0.85}
              disabled={photos.length >= 4}
            >
              <Ionicons name="images" size={18} color={colors.coral[500]} />
              <Text style={styles.photoButtonText}>From library</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW URGENT?</Text>
          <View style={styles.urgencyCol}>
            {URGENCIES.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={[
                  styles.urgencyRow,
                  urgency === u.value && styles.urgencyRowActive,
                ]}
                onPress={() => setUrgency(u.value)}
              >
                <View
                  style={[styles.urgencyDot, { backgroundColor: u.color }]}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.urgencyLabel,
                      urgency === u.value && { color: u.color },
                    ]}
                  >
                    {u.label}
                  </Text>
                  <Text style={styles.urgencySublabel}>{u.sublabel}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW TO REACH YOU</Text>
          <View style={styles.chipsRow}>
            {(["phone", "text", "email"] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chipFlex,
                  contactPref === opt && styles.chipActive,
                ]}
                onPress={() => setContactPref(opt)}
              >
                <Text
                  style={[
                    styles.chipText,
                    contactPref === opt && styles.chipTextActive,
                  ]}
                >
                  {opt === "phone"
                    ? "Call"
                    : opt === "text"
                    ? "Text"
                    : "Email"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.consentRow}>
            <Switch
              value={smsConsent}
              onValueChange={setSmsConsent}
              trackColor={{ false: colors.sand[200], true: colors.coral[400] }}
              thumbColor={smsConsent ? colors.coral[600] : "#fff"}
            />
            <Text style={styles.consentText}>
              Text me with status updates (recommended)
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
            <Text style={styles.submitButtonText}>Send Request</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Free to request — no charge until a vendor confirms the job.
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
    color: colors.gold[400],
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: colors.sand[50],
    fontSize: 28,
    fontWeight: "800",
  },
  coralLine: {
    height: 1,
    width: 56,
    backgroundColor: colors.gold[500],
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.navy[700],
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.sand[200],
    backgroundColor: colors.sand[50],
  },
  chipFlex: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.sand[200],
    backgroundColor: colors.sand[50],
    alignItems: "center",
  },
  chipActive: {
    borderColor: colors.coral[500],
    backgroundColor: colors.coral[50],
  },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.navy[700] },
  chipTextActive: { color: colors.coral[600] },
  urgencyCol: { gap: 8 },
  urgencyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.sand[200],
    backgroundColor: colors.sand[50],
  },
  urgencyRowActive: {
    borderColor: colors.coral[500],
    backgroundColor: colors.coral[50],
  },
  urgencyDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  urgencyLabel: { fontSize: 15, fontWeight: "700", color: colors.navy[800] },
  urgencySublabel: {
    fontSize: 12,
    color: colors.navy[400],
    marginTop: 2,
  },
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
  photoHint: { fontSize: 12, color: colors.navy[400], marginBottom: 10 },
  photoStrip: { marginBottom: 10 },
  photoStripContent: { gap: 8, paddingVertical: 4 },
  photoWrap: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  photoImage: { width: "100%", height: "100%" },
  photoRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(11, 17, 32, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoButtonsRow: { flexDirection: "row", gap: 10 },
  photoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.coral[200],
    backgroundColor: colors.coral[50],
  },
  photoButtonText: { color: colors.coral[600], fontWeight: "700", fontSize: 13 },
});
