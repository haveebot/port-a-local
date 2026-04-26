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
import {
  isMockMode,
  setMockMode,
  resetMockTasks,
  MOCK_WORKERS,
} from "../lib/mock";

export default function SettingsScreen() {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<"runner" | "maintenance">("runner");
  const [apiUrl, setApiUrlState] = useState("");
  const [workerId, setWorkerIdState] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [mockOn, setMockOn] = useState(false);

  useEffect(() => {
    (async () => {
      const id = await getWorkerId();
      const savedName = await getWorkerName();
      const savedGroup = await getWorkerGroup();
      const savedUrl = await getApiUrl();
      const mock = await isMockMode();

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
      setMockOn(mock);
    })();
  }, []);

  const signInAsMock = async (mockGroup: "runner" | "maintenance") => {
    const worker = MOCK_WORKERS.find((w) => w.group_name === mockGroup);
    if (!worker) return;
    await setMockMode(true);
    await setWorkerId(worker.id);
    await saveWorkerName(worker.name);
    await saveWorkerGroup(worker.group_name);
    setMockOn(true);
    setWorkerIdState(worker.id);
    setName(worker.name);
    setGroup(worker.group_name);
    setRegistered(true);
    Alert.alert(
      "Signed in",
      `You're now ${worker.name} (${worker.group_name}). Mock mode is on — all backend calls return seed data.`
    );
  };

  const toggleMock = async (next: boolean) => {
    await setMockMode(next);
    setMockOn(next);
    if (next) {
      Alert.alert(
        "Mock mode on",
        "Tasks and workers come from local seed data. The server is not contacted."
      );
    } else {
      Alert.alert(
        "Mock mode off",
        "Back to live server. You may need to re-register if the server doesn't know your worker id."
      );
    }
  };

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

      // Register for push notifications
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
    Alert.alert("Reset?", "This will remove your registration. You'll need to register again.", [
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
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo / Mock Mode</Text>
        <Text style={styles.hint}>
          Use seeded workers + tasks instead of the live server. Useful for
          demos, App Review screenshots, and onboarding.
        </Text>

        <View style={[styles.mockToggle, mockOn && styles.mockToggleOn]}>
          <Text style={styles.mockToggleLabel}>
            Mock mode is {mockOn ? "ON" : "OFF"}
          </Text>
          <TouchableOpacity
            style={styles.mockToggleButton}
            onPress={() => toggleMock(!mockOn)}
          >
            <Text style={styles.mockToggleButtonText}>
              {mockOn ? "Turn off" : "Turn on"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 14 }]}>Quick sign-in</Text>
        <View style={styles.mockRow}>
          <TouchableOpacity
            style={styles.mockButton}
            onPress={() => signInAsMock("runner")}
          >
            <Text style={styles.mockButtonTitle}>🏃 Maya Cortez</Text>
            <Text style={styles.mockButtonSubtitle}>Runner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mockButton}
            onPress={() => signInAsMock("maintenance")}
          >
            <Text style={styles.mockButtonTitle}>🔧 Diego Alvarez</Text>
            <Text style={styles.mockButtonSubtitle}>Maintenance</Text>
          </TouchableOpacity>
        </View>

        {mockOn && (
          <TouchableOpacity
            style={styles.resetTasksButton}
            onPress={() => {
              resetMockTasks();
              Alert.alert("Mock tasks reset", "Pull to refresh the lists.");
            }}
          >
            <Text style={styles.resetTasksButtonText}>Reseed mock tasks</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Connection</Text>
        <Text style={styles.label}>API URL</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrlState}
          placeholder="http://192.168.1.100:3001"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.hint}>
          Your server&apos;s local IP or ngrok URL. Leave blank for localhost.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Worker Profile</Text>

        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Nick"
          placeholderTextColor="#94a3b8"
          editable={!registered}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Team</Text>
        <View style={styles.groupRow}>
          <TouchableOpacity
            style={[
              styles.groupButton,
              group === "runner" && styles.groupButtonActive,
            ]}
            onPress={() => !registered && setGroup("runner")}
            disabled={registered}
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

      {!registered ? (
        <TouchableOpacity
          style={[styles.registerButton, registering && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={registering}
        >
          <Text style={styles.registerButtonText}>
            {registering ? "Registering..." : "Register & Enable Notifications"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.registeredSection}>
          <View style={styles.registeredCard}>
            <Text style={styles.registeredIcon}>✅</Text>
            <Text style={styles.registeredTitle}>Registered</Text>
            <Text style={styles.registeredSubtext}>
              Worker ID: {workerId}
            </Text>
            <Text style={styles.registeredSubtext}>
              Team: {group} | Name: {name}
            </Text>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset Registration</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#475569", marginBottom: 6 },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  hint: { fontSize: 12, color: "#94a3b8", marginTop: 6 },
  groupRow: {
    flexDirection: "row",
    gap: 10,
  },
  groupButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  groupButtonActive: {
    borderColor: "#0369a1",
    backgroundColor: "#f0f9ff",
  },
  groupButtonText: { fontSize: 15, fontWeight: "600", color: "#94a3b8" },
  groupButtonTextActive: { color: "#0369a1" },
  registerButton: {
    backgroundColor: "#0369a1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  registerButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  registeredSection: { gap: 12 },
  registeredCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  registeredIcon: { fontSize: 40, marginBottom: 8 },
  registeredTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 8,
  },
  registeredSubtext: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  resetButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  resetButtonText: { color: "#dc2626", fontWeight: "600", fontSize: 15 },
  mockToggle: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  mockToggleOn: { backgroundColor: "#fef3c7", borderColor: "#fcd34d" },
  mockToggleLabel: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  mockToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#1e293b",
  },
  mockToggleButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  mockRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  mockButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  mockButtonTitle: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  mockButtonSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  resetTasksButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  resetTasksButtonText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 13,
  },
});
