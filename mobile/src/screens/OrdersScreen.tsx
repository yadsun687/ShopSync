import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

export const OrdersScreen = () => {
  const { colors } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data?.data?.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const cancel = async (id: string) => {
    await api.delete(`/orders/${id}`);
    await load();
  };

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Orders</Text>
      {loading ? (
        <Text style={{ color: colors.muted }}>Loading orders...</Text>
      ) : orders.length === 0 ? (
        <Text style={{ color: colors.muted }}>No orders yet.</Text>
      ) : (
        orders.map((o) => (
          <View key={o._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700" }}>{o.productId?.name || "Unknown Product"}</Text>
              <Text style={{ color: colors.muted }}>Qty {o.quantity} | Total ${Number(o.totalPrice).toFixed(2)} | {o.status}</Text>
            </View>
            {o.status !== "cancelled" ? (
              <Pressable onPress={() => cancel(o._id)} style={[styles.btn, { backgroundColor: colors.danger }]}>
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  btn: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  btnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});
