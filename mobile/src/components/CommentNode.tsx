import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export const CommentNode = ({
  comment,
  depth = 0,
  onAddReply,
}: {
  comment: any;
  depth?: number;
  onAddReply: (id: string, content: string) => Promise<void>;
}) => {
  const { colors } = useTheme();
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");

  const submit = async () => {
    if (!text.trim()) return;
    await onAddReply(comment._id, text.trim());
    setText("");
    setReplying(false);
  };

  return (
    <View style={{ marginLeft: depth * 14 }}>
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={{ color: colors.text }}>{comment.content}</Text>
        <Pressable onPress={() => setReplying((v) => !v)}>
          <Text style={{ color: colors.primary, marginTop: 6 }}>{replying ? "Cancel" : "Reply"}</Text>
        </Pressable>

        {replying ? (
          <View style={styles.replyRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Write a reply"
              placeholderTextColor={colors.muted}
            />
            <Pressable onPress={submit} style={[styles.btn, { backgroundColor: colors.primary }]}>
              <Text style={styles.btnText}>Send</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      {comment.replies?.map((r: any) => (
        <CommentNode key={r._id || `${r.content}-${Math.random()}`} comment={r} depth={depth + 1} onAddReply={onAddReply} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 },
  replyRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, flex: 1 },
  btn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  btnText: { color: "#FFFFFF", fontWeight: "700" },
});
