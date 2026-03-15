import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { useTheme } from "../context/ThemeContext";
import { useSyncQueue } from "../context/SyncQueueContext";
import api from "../services/api";
import type { RootStackParamList } from "../navigation/types";
import { getCache, saveCache } from "../utils/storage";
import { enqueueSyncRequest } from "../services/syncQueue";

const INVENTORY_CACHE_KEY = "cache_inventory_products";

export const InventoryScreen = () => {
  const { colors } = useTheme();
  const { refreshQueueSize } = useSyncQueue();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const latest = res.data?.data?.products || [];
      setProducts(latest);
      await saveCache(INVENTORY_CACHE_KEY, latest);
      setToast("");
    } catch {
      const cached = await getCache<any[]>(INVENTORY_CACHE_KEY);
      if (cached?.length) {
        setProducts(cached);
        setToast("Offline mode: showing last saved inventory.");
      } else {
        setToast("Unable to load inventory. No cached data available.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const deleteProduct = async (id: string) => {
    const prev = [...products];
    const next = prev.filter((x) => x._id !== id);
    setProducts(next);
    await saveCache(INVENTORY_CACHE_KEY, next);
    setToast("Deleting product...");
    try {
      await api.delete(`/products/${id}`);
      setToast("Product deleted");
    } catch {
      const queueLength = await enqueueSyncRequest({ method: "DELETE", url: `/products/${id}` });
      await refreshQueueSize();
      setToast(`Offline/server issue: delete queued for sync (${queueLength} pending).`);
    }
  };

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Inventory</Text>
      {!!toast && <Text style={{ color: colors.muted }}>{toast}</Text>}
      {loading ? (
        <Text style={{ color: colors.muted }}>Loading inventory...</Text>
      ) : products.length === 0 ? (
        <Text style={{ color: colors.muted }}>No products found.</Text>
      ) : (
        products.map((p) => (
          <View key={p._id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700" }}>{p.name}</Text>
              <Text style={{ color: colors.muted }}>{p.category} | Price ${Number(p.price).toFixed(2)} | Stock {p.stock}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => nav.navigate("ProductReviews", { productId: p._id, productName: p.name })} style={[styles.btn, { backgroundColor: colors.primary }]}>
                <Text style={styles.btnText}>Reviews</Text>
              </Pressable>
              <Pressable onPress={() => deleteProduct(p._id)} style={[styles.btn, { backgroundColor: colors.danger }]}>
                <Text style={styles.btnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { borderWidth: 1, borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  actions: { gap: 6 },
  btn: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  btnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});
