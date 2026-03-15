import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { Screen } from "../components/Screen";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { getCache, saveCache } from "../utils/storage";

const DASHBOARD_STATS_CACHE_KEY = "cache_dashboard_stats";
const DASHBOARD_PRODUCTS_COUNT_CACHE_KEY = "cache_dashboard_product_count";

export const DashboardScreen = () => {
  const { colors, config } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [statsError, setStatsError] = useState("");
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [statsRes, productsRes] = await Promise.allSettled([
        api.get("/products/stats"),
        api.get("/products"),
      ]);

      if (statsRes.status === "fulfilled") {
        const latestStats = statsRes.value.data?.data;
        setStats(latestStats);
        await saveCache(DASHBOARD_STATS_CACHE_KEY, latestStats);
        setStatsError("");
      } else {
        const cachedStats = await getCache<any>(DASHBOARD_STATS_CACHE_KEY);
        if (cachedStats) {
          setStats(cachedStats);
          setStatsError("Offline mode: showing last saved stats.");
        } else {
          setStatsError("Failed to load stats. Product list is still available.");
        }
      }

      if (productsRes.status === "fulfilled") {
        const latestCount = productsRes.value.data?.data?.products?.length || 0;
        setProductCount(latestCount);
        await saveCache(DASHBOARD_PRODUCTS_COUNT_CACHE_KEY, latestCount);
      } else {
        const cachedCount = await getCache<number>(DASHBOARD_PRODUCTS_COUNT_CACHE_KEY);
        if (typeof cachedCount === "number") {
          setProductCount(cachedCount);
        }
      }

      setLoading(false);
    })();
  }, []);

  const categoryData = useMemo(() => stats?.totalByCategory || [], [stats]);
  const maxCategory = Math.max(...categoryData.map((x: any) => x.count), 1);
  const isDark = config.theme === "dark";

  const GlassPanel = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
    <View
      style={[
        styles.glassPanel,
        {
          backgroundColor: isDark ? "rgba(31, 41, 55, 0.35)" : "rgba(255, 255, 255, 0.52)",
          borderColor: isDark ? "rgba(148, 163, 184, 0.24)" : "rgba(255, 255, 255, 0.80)",
        },
        style,
      ]}
    >
      <BlurView
        intensity={isDark ? 35 : 55}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.glassInner}>{children}</View>
    </View>
  );

  return (
    <Screen>
      <View pointerEvents="none" style={[styles.blobA, { backgroundColor: `${colors.primary}55` }]} />
      <View pointerEvents="none" style={[styles.blobB, { backgroundColor: isDark ? "#22D3EE44" : "#60A5FA44" }]} />

      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: 0.2 }}>Dashboard</Text>
      <Text style={{ color: colors.muted, marginTop: -4, marginBottom: 4 }}>Live product analytics overview</Text>

      {loading ? (
        <View style={{ gap: 10 }}>
          <View style={[styles.skeleton, { backgroundColor: isDark ? "rgba(55,65,81,0.45)" : "rgba(255,255,255,0.55)", borderColor: colors.border }]} />
          <View style={[styles.skeleton, { backgroundColor: isDark ? "rgba(55,65,81,0.45)" : "rgba(255,255,255,0.55)", borderColor: colors.border }]} />
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <GlassPanel style={styles.metricPanel}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>Max Sale Price</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                ${(stats?.maxSalePrice || 0).toFixed(2)}
              </Text>
            </GlassPanel>
            <GlassPanel style={styles.metricPanel}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>Average Sale Price</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                ${(stats?.avgSalePrice || 0).toFixed(2)}
              </Text>
            </GlassPanel>
          </View>

          <GlassPanel style={styles.totalPanel}>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>Total Products</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{String(productCount)}</Text>
          </GlassPanel>

          {!!statsError && <Text style={{ color: colors.danger }}>{statsError}</Text>}

          <GlassPanel style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Products by Category</Text>
            {categoryData.map((item: any) => (
              <View key={item._id} style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.text }]}>{item._id}</Text>
                <View style={[styles.barBg, { backgroundColor: isDark ? "rgba(148,163,184,0.22)" : "rgba(148,163,184,0.28)" }]}>
                  <View
                    style={[
                      styles.barFill,
                      { backgroundColor: colors.primary, width: `${(item.count / maxCategory) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.barCount, { color: colors.text }]}>{item.count}</Text>
              </View>
            ))}
          </GlassPanel>
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  blobA: {
    position: "absolute",
    top: 8,
    right: 12,
    width: 160,
    height: 160,
    borderRadius: 99,
  },
  blobB: {
    position: "absolute",
    top: 148,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 99,
  },
  row: { flexDirection: "row", gap: 8 },
  skeleton: { height: 72, borderRadius: 12, borderWidth: 1 },
  glassPanel: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  glassInner: {
    padding: 14,
    gap: 8,
  },
  metricPanel: { flex: 1 },
  totalPanel: { marginTop: 2 },
  metricLabel: { fontSize: 12, fontWeight: "600" },
  metricValue: { fontSize: 24, fontWeight: "800" },
  chartCard: { gap: 10 },
  chartTitle: { fontSize: 16, fontWeight: "700" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabel: { width: 90, fontSize: 12 },
  barBg: { flex: 1, height: 10, borderRadius: 99, overflow: "hidden" },
  barFill: { height: 10, borderRadius: 99 },
  barCount: { width: 24, textAlign: "right", fontSize: 12 },
});
