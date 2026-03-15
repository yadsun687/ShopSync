import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";

export const Screen = ({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}) => {
  const { colors } = useTheme();

  if (scroll) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}> 
        <ScrollView contentContainerStyle={[styles.content, style]}>{children}</ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}> 
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 12 },
});
