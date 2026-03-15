import React from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { useSyncQueue } from "../context/SyncQueueContext";
import { useTheme } from "../context/ThemeContext";

export const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const { queueSize, syncing, syncNow } = useSyncQueue();
  const { config, toggleTheme, setPrimaryColor, colors } = useTheme();

  return (
    <Screen>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={{ color: colors.muted }}>Signed in as {user?.username} ({user?.role})</Text>

        <View style={styles.rowBetween}>
          <Text style={{ color: colors.text }}>Dark Theme</Text>
          <Switch value={config.theme === "dark"} onValueChange={toggleTheme} />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Primary Color (hex)</Text>
        <TextInput
          value={config.primaryColor}
          onChangeText={(v) => setPrimaryColor(v)}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          autoCapitalize="none"
          placeholder="#3B82F6"
          placeholderTextColor={colors.muted}
        />
        <View style={[styles.swatch, { backgroundColor: colors.primary }]} />

        <View style={[styles.queueCard, { borderColor: colors.border }]}> 
          <Text style={[styles.label, { color: colors.text }]}>Sync Queue</Text>
          <Text style={{ color: colors.muted }}>
            {queueSize} pending action(s) {syncing ? "- syncing..." : ""}
          </Text>
          <Text onPress={() => void syncNow()} style={[styles.syncNow, { color: colors.primary }]}>Sync Now</Text>
        </View>

        <Text onPress={() => void logout()} style={[styles.logout, { color: colors.danger }]}>Logout</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  swatch: { height: 36, borderRadius: 8 },
  queueCard: { borderWidth: 1, borderRadius: 8, padding: 10, gap: 4 },
  syncNow: { fontWeight: "700", marginTop: 2 },
  logout: { marginTop: 8, fontWeight: "700", textAlign: "center" },
});
