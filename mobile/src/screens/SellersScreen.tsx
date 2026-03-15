import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { useTheme } from "../context/ThemeContext";

const rankForPower = (power: number) => {
  if (power >= 100) return { rank: "Diamond", color: "#06B6D4" };
  if (power >= 60) return { rank: "Gold", color: "#F59E0B" };
  return { rank: "Silver", color: "#9CA3AF" };
};

export const SellersScreen = () => {
  const { colors } = useTheme();
  const [sellers, setSellers] = useState([
    { id: "1", name: "Alice", power: 30 },
    { id: "2", name: "Bob", power: 75 },
    { id: "3", name: "Charlie", power: 120 },
  ]);

  const sorted = useMemo(() => [...sellers].sort((a, b) => b.power - a.power), [sellers]);

  const levelUp = (id: string) => {
    const bonus = Math.floor(Math.random() * 11) + 5;
    setSellers((prev) => prev.map((s) => (s.id === id ? { ...s, power: s.power + bonus } : s)));
  };

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Seller Rankings</Text>
      {sorted.map((seller, idx) => {
        const rankMeta = rankForPower(seller.power);
        return (
          <View key={seller.id} style={[styles.card, { backgroundColor: colors.card, borderColor: rankMeta.color }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700" }}>#{idx + 1} {seller.name}</Text>
              <Text style={{ color: colors.muted }}>Power {seller.power}</Text>
            </View>
            <View style={[styles.rankBadge, { backgroundColor: rankMeta.color }]}>
              <Text style={styles.rankText}>{rankMeta.rank}</Text>
            </View>
            <Pressable onPress={() => levelUp(seller.id)} style={[styles.btn, { backgroundColor: colors.primary }]}>
              <Text style={styles.btnText}>Level Up</Text>
            </Pressable>
          </View>
        );
      })}
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 2, borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  rankBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  rankText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  btn: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  btnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});
