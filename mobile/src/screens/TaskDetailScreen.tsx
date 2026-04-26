import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchTask, acceptTask, completeTask, Task } from "../lib/api";
import { getWorkerId } from "../lib/storage";
import { colors } from "../lib/theme";
import {
  TasksStackParamList,
  MyTasksStackParamList,
} from "../lib/navigation";

type Props =
  | NativeStackScreenProps<TasksStackParamList, "TaskDetail">
  | NativeStackScreenProps<MyTasksStackParamList, "MyTaskDetail">;

export default function TaskDetailScreen({ route, navigation }: Props) {
  const { taskId, task: paramTask } = route.params;
  const [task, setTask] = useState<Task | null>(paramTask ?? null);
  const [loading, setLoading] = useState(!paramTask);
  const [acting, setActing] = useState(false);
  const [workerId, setWorkerIdState] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const t = await fetchTask(taskId);
      setTask(t);
    } catch {
      if (!paramTask) {
        Alert.alert(
          "Could not load task",
          "Check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [taskId, paramTask]);

  useEffect(() => {
    (async () => {
      setWorkerIdState(await getWorkerId());
    })();
    load();
  }, [load]);

  const handleAccept = async () => {
    if (!workerId || !task) return;
    setActing(true);
    try {
      const updated = await acceptTask(task.id, workerId);
      setTask(updated);
      Alert.alert("Accepted", `You accepted: ${task.title}`);
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not accept task. Try again.");
    } finally {
      setActing(false);
    }
  };

  const handleComplete = () => {
    if (!task) return;
    Alert.alert("Complete Task?", `Mark "${task.title}" as done?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          setActing(true);
          try {
            const updated = await completeTask(task.id);
            setTask(updated);
            navigation.goBack();
          } catch {
            Alert.alert("Error", "Could not complete task. Try again.");
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.coral[500]} size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Task not found.</Text>
      </View>
    );
  }

  const isMine = task.accepted_by === workerId;
  const canAccept = task.status === "pending";
  const canComplete = task.status === "accepted" && isMine;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        <View style={styles.coralAccent} />
        <View style={styles.cardBody}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.badge,
                task.group_target === "runner"
                  ? styles.badgeRunner
                  : task.group_target === "maintenance"
                  ? styles.badgeMaintenance
                  : styles.badgeAll,
              ]}
            >
              <Text style={styles.badgeText}>{task.group_target}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                task.status === "pending"
                  ? styles.statusPending
                  : task.status === "accepted"
                  ? styles.statusAccepted
                  : styles.statusComplete,
              ]}
            >
              <Text style={styles.statusBadgeText}>{task.status}</Text>
            </View>
          </View>

          <Text style={styles.title}>{task.title}</Text>

          {task.description && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Details</Text>
              <Text style={styles.description}>{task.description}</Text>
            </>
          )}

          {task.property && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Property</Text>
              <Text style={styles.property}>📍 {task.property}</Text>
            </>
          )}

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Timeline</Text>
          <View style={styles.timelineRow}>
            <View style={styles.timelineDot} />
            <View>
              <Text style={styles.timelineLabel}>Created</Text>
              <Text style={styles.timelineTime}>
                {new Date(task.created_at + "Z").toLocaleString()}
              </Text>
            </View>
          </View>
          {task.accepted_at && (
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, styles.timelineDotCoral]} />
              <View>
                <Text style={styles.timelineLabel}>Accepted</Text>
                <Text style={styles.timelineTime}>
                  {new Date(task.accepted_at + "Z").toLocaleString()}
                </Text>
              </View>
            </View>
          )}
          {task.completed_at && (
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, styles.timelineDotGold]} />
              <View>
                <Text style={styles.timelineLabel}>Completed</Text>
                <Text style={styles.timelineTime}>
                  {new Date(task.completed_at + "Z").toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {canAccept && (
        <TouchableOpacity
          style={[styles.primaryButton, acting && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={acting}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            {acting ? "Accepting..." : "Accept Task"}
          </Text>
        </TouchableOpacity>
      )}

      {canComplete && (
        <TouchableOpacity
          style={[styles.completeButton, acting && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={acting}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            {acting ? "Completing..." : "Mark Complete"}
          </Text>
        </TouchableOpacity>
      )}

      {task.status === "accepted" && !isMine && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Already accepted by another worker.
          </Text>
        </View>
      )}

      {task.status === "completed" && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>This task is complete.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.sand[50],
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
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
  cardBody: { padding: 22 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: { backgroundColor: colors.navy[100] },
  statusAccepted: { backgroundColor: colors.gold[100] },
  statusComplete: { backgroundColor: colors.seafoam[50] },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.navy[800],
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.navy[900],
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: colors.sand[200],
    marginVertical: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: colors.navy[700],
    lineHeight: 22,
  },
  property: { fontSize: 15, color: colors.navy[700] },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.navy[300],
    marginRight: 12,
  },
  timelineDotCoral: { backgroundColor: colors.coral[500] },
  timelineDotGold: { backgroundColor: colors.gold[500] },
  timelineLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.navy[800],
  },
  timelineTime: { fontSize: 12, color: colors.navy[400] },
  primaryButton: {
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
  completeButton: {
    backgroundColor: colors.seafoam[600],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  infoCard: {
    backgroundColor: colors.sand[100],
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sand[200],
  },
  infoText: { color: colors.navy[700], fontSize: 14 },
  emptyText: { color: colors.navy[400], fontSize: 15 },
});
