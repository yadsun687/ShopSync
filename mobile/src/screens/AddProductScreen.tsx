import React, { useState } from "react";
import { Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { DynamicFormBuilder } from "../components/DynamicFormBuilder";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const fieldConfig = [
  { name: "name", label: "Product Name", type: "text", required: true, min: 3 },
  { name: "category", label: "Category", type: "select", required: true, options: ["Electronics", "Home", "Fashion", "Food"] },
  { name: "stock", label: "Stock", type: "number", required: true, min: 0 },
  { name: "tags", label: "Tags (comma separated)", type: "text" },
  {
    name: "pricing",
    label: "Pricing",
    type: "group",
    fields: [
      { name: "price", label: "Selling Price", type: "number", required: true, min: 0 },
      { name: "originalPrice", label: "Original Price", type: "number", required: true, min: 0 },
      { name: "hasDiscount", label: "Apply Discount", type: "checkbox" },
      { name: "discountPercent", label: "Discount Percent", type: "number", min: 0, max: 100, showIf: { hasDiscount: true }, required: true },
    ],
  },
] as const;

export const AddProductScreen = () => {
  const { colors } = useTheme();
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState<any>(null);

  const submit = async (data: any) => {
    setMessage("");
    setCreated(null);
    const payload = {
      name: data.name,
      category: data.category,
      stock: data.stock,
      tags: data.tags ? String(data.tags).split(",").map((t) => t.trim()).filter(Boolean) : [],
      price: data.pricing.price,
      originalPrice: data.pricing.originalPrice,
      discountPercent: data.pricing.hasDiscount ? data.pricing.discountPercent : 0,
    };
    try {
      const res = await api.post("/products", payload);
      setCreated(res.data?.data?.product);
      setMessage("Product created successfully");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to create product");
    }
  };

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Add Product</Text>
      <DynamicFormBuilder fieldConfig={fieldConfig as any} onSubmit={submit} />
      {!!message && <Text style={{ color: message.includes("success") ? colors.success : colors.danger }}>{message}</Text>}
      {created ? (
        <View style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 }}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>Created Product</Text>
          <Text style={{ color: colors.text }}>Name: {created.name}</Text>
          <Text style={{ color: colors.text }}>Category: {created.category}</Text>
          <Text style={{ color: colors.text }}>Price: ${created.price}</Text>
          <Text style={{ color: colors.text }}>Stock: {created.stock}</Text>
        </View>
      ) : null}
    </Screen>
  );
};
