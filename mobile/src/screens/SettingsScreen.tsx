import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { registerWorker, registerPushToken } from "../lib/api";
import { setApiBase } from "../lib/api";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import {
  getWorkerId,
  setWorkerId,
  getWorkerName,
  setWorkerName as saveWorkerName,
  getWorkerGroup,
  setWorkerGroup as saveWorkerGroup,
  getApiUrl,
  setApiUrl as saveApiUrl,
  clearAll,
} from "../lib/storage";
import { colors } from "../lib/theme";

export default function SettingsScreen() {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<"runner" | "maintenance">("runner");
  const [apiUrl, setApiUrlState] = useState("");
  const [workerId, setWorkerIdState] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    (async () => {
      const id = await getWorkerId();
      const savedName = await getWorkerName();
      const savedGroup = await getWorkerGroup();
      const savedUrl = await getApiUrl();

      if (id) {
        setWorkerIdState(id);
        setRegistered(true);
      }
      if (savedName) setName(savedName);
      if (savedGroup) setGroup(savedGroup as "runner" | "maintenance");
      if (savedUrl) {
        setApiUrlState(savedUrl);
        setApiBase(savedUrl);
      }
    })();
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your name.");
      return;
    }

    if (apiUrl.trim()) {
      setApiBase(apiUrl.trim());
      await saveApiUrl(apiUrl.trim());
    }

    setRegistering(true);

    try {
      const worker = await registerWorker(name.trim(), group);
      await setWorkerId(worker.id);
      await saveWorkerName(name.trim());
      await saveWorkerGroup(group);
      setWorkerIdState(worker.id);
      setRegistered(true);

      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await registerPushToken(worker.id, pushToken);
        Alert.alert(
          "Registered!",
          `You're all set, ${name}. You'll receive push notifications for ${group} tasks.`
        );
      } else {
        Alert.alert(
          "Registered!",
          `You're registered, ${name}, but push notifications couldn't be enabled. Make sure you're on a physical device and have allowed notifications.`
        );
      }
    } catch {
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Check the API URL and try again."
      );
    }

    setRegistering(false);
  };

  const handleReset = async () => {
    Alert.alert(
      "Reset?",
      "This will remove your registration. You'll need to register again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await clearAll();
            setWorkerIdState(null);
            setRegistered(false);
            setName("");
            setGroup("runner");
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <View style={styles.coralAccent} />
        <View style={styles.sectionBody}>
          <Text style={styles.eyebrow}>Connection</Text>
          <Text style={styles.sectionTitle}>Server</Text>
          <View style={styles.coralLine} />

          <Text style={styles.label}>API URL</Text>
          <TextInput
            style={styles.input}
            value={apiUrl}
            onChangeText={setApiUrlState}
            placeholder="http://192.168.1.100:3001"
            placeholderTextColor={colors.navy[300]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Text style={styles.hint}>
            Your server&apos;s local IP or ngrok URL. Leave blank for localhost.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.coralAccent} />
        <View style={styles.sectionBody}>
          <Text style={styles.eyebrow}>Profile</Text>
          <Text style={styles.sectionTitle}>Worker</Text>
          <View style={styles.coralLine} />

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Nick"
            placeholderTextColor={colors.navy[300]}
            editable={!registered}
          />

          <Text style={[styles.label, { marginTop: 18 }]}>Team</Text>
          <View style={styles.groupRow}>
            <TouchableOpacity
              style={[
                styles.groupButton,
                group === "runner" && styles.groupButtonActive,
              ]}
              onPress={() => !registered && setGroup("runner")}
              disabled={registered}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.groupButtonText,
                  group === "runner" && styles.groupButtonTextActive,
                ]}
              >
                🏃 Runner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.groupButton,
                group === "maintenance" && styles.groupButtonActive,
              ]}
              onPress={() => !registered && setGroup("maintenance")}
              disabled={registered}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.groupButtonText,
                  group === "maintenance" && styles.groupButtonTextActive,
                ]}
              >
                🔧 Maintenance
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {!registered ? (
        <TouchableOpacity
          style={[styles.registerButton, registering && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={registering}
          activeOpacity={0.85}
        >
          <Text style={styles.registerButtonText}>
            {registering ? "Registering..." : "Register & Enable Notifications"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.registeredSection}>
          <View style={styles.registeredCard}>
            <View style={styles.goldAccent} />
            <View style={styles.registeredBody}>
              <Text style={styles.registeredIcon}>✅</Text>
              <Text style={styles.registeredTitle}>Registered</Text>
              <View style={styles.goldLine} />
              <Text style={styles.registeredSubtext}>Worker ID: {workerId}</Text>
              <Text style={styles.registeredSubtext}>
                Team: {group} · Name: {name}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.85}
          >
            <Text style={styles.resetButtonText}>Reset Registration</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.sand[200],
    overflow: "hidden",
    shadowColor: colors.navy[950],
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  coralAccent: { height: 3, backgroundColor: colors.coral[500] },
  goldAccent: { height: 3, backgroundColor: colors.gold[500] },
  sectionBody: { padding: 20 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 8,
  },
  coralLine: {
    height: 1,
    backgroundColor: colors.coral[200],
    marginBottom: 18,
    width: 60,
  },
  goldLine: {
    height: 1,
    backgroundColor: colors.gold[300],
    marginBottom: 12,
    width: 60,
    alignSelf: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.navy[700],
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.sand[50],
    borderWidth: 1,
    borderColor: colors.sand[200],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.navy[900],
  },
  hint: { fontSize: 12, color: colors.navy[400], marginTop: 6 },
  groupRow: { flexDirection: "row", gap: 10 },
  groupButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.sand[200],
    alignItems: "center",
    backgroundColor: colors.sand[50],
  },
  groupButtonActive: {
    borderColor: colors.coral[500],
    backgroundColor: colors.coral[50],
  },
  groupButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy[400],
  },
  groupButtonTextActive: { color: colors.coral[600] },
  registerButton: {
    backgroundColor: colors.coral[500],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.coral[600],
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.6 },
  registerButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  registeredSection: { gap: 12 },
  registeredCard: {
    backgroundColor: colors.navy[950],
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.navy[950],
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  registeredBody: {
    padding: 28,
    alignItems: "center",
  },
  registeredIcon: { fontSize: 40, marginBottom: 8 },
  registeredTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.gold[400],
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  registeredSubtext: {
    fontSize: 13,
    color: colors.navy[200],
    marginTop: 2,
  },
  resetButton: {
    backgroundColor: colors.coral[100],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.coral[200],
  },
  resetButtonText: {
    color: colors.coral[700],
    fontWeight: "600",
    fontSize: 15,
  },
});
