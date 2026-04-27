import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchTasks, acceptTask, Task } from "../lib/api";
import { getWorkerId, getWorkerGroup } from "../lib/storage";
import { colors } from "../lib/theme";
import { TasksStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<TasksStackParamList, "TasksList">;

export default function TasksScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [workerId, setWorkerIdState] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const id = await getWorkerId();
      setWorkerIdState(id);
      if (!id) return;

      const group = (await getWorkerGroup()) ?? undefined;
      const data = await fetchTasks({ group, status: "pending" });
      setTasks(data);
    } catch {
      // Silently fail on network errors during refresh
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleAccept = async (task: Task) => {
    if (!workerId) {
      Alert.alert("Setup Required", "Go to Settings to register first.");
      return;
    }

    try {
      await acceptTask(task.id, workerId);
      Alert.alert("Accepted", `You accepted: ${task.title}`);
      loadTasks();
    } catch {
      Alert.alert("Error", "Could not accept task. Try again.");
    }
  };

  if (!workerId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👤</Text>
        <Text style={styles.emptyTitle}>Setup Required</Text>
        <Text style={styles.emptyText}>
          Go to the Settings tab to enter your name and register.
        </Text>
      </View>
    );
  }

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("TaskDetail", { taskId: item.id, task: item })
      }
    >
      <View style={styles.coralAccent} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View
            style={[
              styles.badge,
              item.group_target === "runner"
                ? styles.badgeRunner
                : item.group_target === "maintenance"
                ? styles.badgeMaintenance
                : styles.badgeAll,
            ]}
          >
            <Text style={styles.badgeText}>{item.group_target}</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.cardDescription}>{item.description}</Text>
        )}

        {item.property && (
          <Text style={styles.cardProperty}>📍 {item.property}</Text>
        )}

        <Text style={styles.cardTime}>
          {new Date(item.created_at + "Z").toLocaleString()}
        </Text>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAccept(item)}
          activeOpacity={0.85}
        >
          <Text style={styles.acceptButtonText}>Accept Task</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.coral[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No Pending Tasks</Text>
            <Text style={styles.emptyText}>
              Pull down to refresh. You&apos;ll get a notification when a new
              task comes in.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
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
  cardBody: { padding: 20 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.navy[900],
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeRunner: { backgroundColor: colors.coral[100] },
  badgeMaintenance: { backgroundColor: colors.gold[100] },
  badgeAll: { backgroundColor: colors.sand[100] },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.navy[800],
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardDescription: {
    fontSize: 14,
    color: colors.navy[700],
    marginBottom: 8,
    lineHeight: 20,
  },
  cardProperty: { fontSize: 13, color: colors.navy[500], marginBottom: 4 },
  cardTime: { fontSize: 12, color: colors.sand[400], marginBottom: 14 },
  acceptButton: {
    backgroundColor: colors.coral[500],
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    paddingTop: 100,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.navy[400],
    textAlign: "center",
    lineHeight: 22,
  },
});
