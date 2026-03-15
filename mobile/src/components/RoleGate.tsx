import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { Role } from "../utils/constants";

export const RoleGate = ({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const { colors } = useTheme();

  if (!user) return null;
  if (user.role === "admin" || allow.includes(user.role)) return <>{children}</>;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <Text style={[styles.title, { color: colors.text }]}>403 Forbidden</Text>
      <Text style={[styles.text, { color: colors.muted }]}>You do not have permission to view this screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  text: { fontSize: 14 },
});
