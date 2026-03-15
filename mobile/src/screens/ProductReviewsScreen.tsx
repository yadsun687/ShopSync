import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { CommentNode } from "../components/CommentNode";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { addReply } from "../utils/commentUtils";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ProductReviews">;

export const ProductReviewsScreen = ({ route }: Props) => {
  const { colors } = useTheme();
  const { productId } = route.params;
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/comments?productId=${productId}`);
        setComments(res.data?.data?.comments || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const createComment = async () => {
    if (!newComment.trim()) return;
    const res = await api.post("/comments", { content: newComment.trim(), productId });
    setComments((prev) => [...prev, res.data?.data?.comment]);
    setNewComment("");
  };

  const onAddReply = async (targetId: string, content: string) => {
    const res = await api.post(`/comments/${targetId}/reply`, { content });
    setComments((prev) => addReply(prev, targetId, res.data?.data?.reply));
  };

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Product Reviews</Text>
      <View style={styles.newRow}>
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Write a review"
          placeholderTextColor={colors.muted}
        />
        <Pressable onPress={createComment} style={[styles.btn, { backgroundColor: colors.primary }]}>
          <Text style={styles.btnText}>Post</Text>
        </Pressable>
      </View>
      {loading ? (
        <Text style={{ color: colors.muted }}>Loading reviews...</Text>
      ) : comments.length === 0 ? (
        <Text style={{ color: colors.muted }}>No reviews yet.</Text>
      ) : (
        comments.map((comment) => <CommentNode key={comment._id} comment={comment} onAddReply={onAddReply} />)
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  newRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, flex: 1 },
  btn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  btnText: { color: "#FFFFFF", fontWeight: "700" },
});
