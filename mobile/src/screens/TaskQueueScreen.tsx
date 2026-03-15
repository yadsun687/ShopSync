import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const statusColor = (status: string) => {
  if (status === "completed") return "#16A34A";
  if (status === "running") return "#2563EB";
  return "#CA8A04";
};

export const TaskQueueScreen = () => {
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<any[]>([]);
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);

  const runningCount = tasks.filter((t) => t.status === "running").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.length - runningCount - completedCount;
  const allDone = started && tasks.length > 0 && completedCount === tasks.length;

  const startQueue = async () => {
    setStarting(true);
    try {
      const res = await api.post("/queue/start");
      setTasks(res.data?.tasks || []);
      setStarted(true);
    } finally {
      setStarting(false);
    }
  };

  const pollStatus = useCallback(async () => {
    const res = await api.get("/queue/status");
    setTasks(res.data?.tasks || []);
  }, []);

  // Dependencies: [tasks, runningCount]
  // tasks is needed to stop polling once all tasks complete.
  // runningCount is needed to react when running slots free up and queue state changes.
  useEffect(() => {
    if (!started || allDone) return;
    const id = setInterval(() => {
      void pollStatus();
    }, 500);
    return () => clearInterval(id);
  }, [tasks, runningCount, started, allDone, pollStatus]);

  const summary = useMemo(() => [
    { label: "Running", value: runningCount, color: "#2563EB" },
    { label: "Pending", value: pendingCount, color: "#CA8A04" },
    { label: "Completed", value: completedCount, color: "#16A34A" },
    { label: "Total", value: tasks.length, color: colors.muted },
  ], [runningCount, pendingCount, completedCount, tasks.length, colors.muted]);

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Bulk Operations</Text>
      <Text style={{ color: colors.muted }}>Runs store operations with max 2 concurrent workers.</Text>
      <Pressable onPress={startQueue} style={[styles.startBtn, { backgroundColor: colors.primary }]} disabled={starting || (started && !allDone)}>
        <Text style={styles.startText}>{starting ? "Starting..." : allDone ? "Run Again" : "Run All Operations"}</Text>
      </Pressable>

      <View style={styles.summaryRow}>
        {summary.map((s) => (
          <View key={s.label} style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: s.color, fontWeight: "700", fontSize: 20 }}>{s.value}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {tasks.map((t) => (
        <View key={t.id} style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.taskHeader}>
            <Text style={{ color: colors.text, fontWeight: "700" }}>{t.icon || "-"} {t.name || `Task #${t.id}`}</Text>
            <Text style={{ color: statusColor(t.status), fontWeight: "700" }}>{t.status}</Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{t.category || "general"}</Text>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: statusColor(t.status), width: `${t.progress || 0}%` }]} />
          </View>
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: "right" }}>{t.progress || 0}%</Text>
        </View>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  startBtn: { borderRadius: 8, paddingVertical: 11, paddingHorizontal: 14, marginTop: 6 },
  startText: { color: "#FFFFFF", textAlign: "center", fontWeight: "700" },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  summaryCard: { borderWidth: 1, borderRadius: 10, padding: 10, minWidth: "23%", alignItems: "center" },
  taskCard: { borderWidth: 1, borderRadius: 10, padding: 10, gap: 6 },
  taskHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressBg: { height: 8, borderRadius: 99, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 99 },
});
