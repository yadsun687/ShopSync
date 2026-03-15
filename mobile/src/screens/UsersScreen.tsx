import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../components/Screen";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { getCache, saveCache } from "../utils/storage";

const USERS_CACHE_KEY = "cache_users_list";

export const UsersScreen = () => {
  const { colors } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/users");
        const latestUsers = res.data?.data?.users || [];
        setUsers(latestUsers);
        await saveCache(USERS_CACHE_KEY, latestUsers);
        setInfo("");
      } catch {
        const cachedUsers = await getCache<any[]>(USERS_CACHE_KEY);
        if (cachedUsers?.length) {
          setUsers(cachedUsers);
          setInfo("Offline mode: showing last saved users.");
        } else {
          setInfo("Unable to load users. No cached data available.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, term]);

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Users</Text>
      <TextInput
        value={term}
        onChangeText={setTerm}
        placeholder="Search by username or email"
        placeholderTextColor={colors.muted}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
      />
      {!!info && <Text style={{ color: colors.muted }}>{info}</Text>}
      {loading ? (
        <Text style={{ color: colors.muted }}>Loading users...</Text>
      ) : filtered.length === 0 ? (
        <Text style={{ color: colors.muted }}>No users found.</Text>
      ) : (
        filtered.map((u) => (
          <View key={u._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
              <Text style={{ color: colors.text, fontWeight: "700" }}>{u.username}</Text>
              <Text style={{ color: colors.muted }}>{u.email}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>{u.role}</Text>
            </View>
          </View>
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  card: { borderWidth: 1, borderRadius: 10, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
});
