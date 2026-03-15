import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { loginSchema } from "../schemas/authSchemas";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
type FormData = { email: string; password: string };

export const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();
  const { colors } = useTheme();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormData) => {
    await login(values.email, values.password);
  };

  return (
    <Screen>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>ShopSync Login</Text>

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={value}
              onChangeText={onChange}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
            />
          )}
        />
        {errors.email ? <Text style={styles.error}>{errors.email.message}</Text> : null}

        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              secureTextEntry
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={value}
              onChangeText={onChange}
              placeholder="********"
              placeholderTextColor={colors.muted}
            />
          )}
        />
        {errors.password ? <Text style={styles.error}>{errors.password.message}</Text> : null}

        <TouchableOpacity disabled={isSubmitting} style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.buttonText}>{isSubmitting ? "Logging in..." : "Login"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={[styles.link, { color: colors.primary }]}>No account? Register</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  label: { fontWeight: "600", marginTop: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  error: { color: "#DC2626", fontSize: 12 },
  button: { borderRadius: 8, paddingVertical: 12, marginTop: 10 },
  buttonText: { color: "#FFFFFF", textAlign: "center", fontWeight: "700" },
  link: { textAlign: "center", marginTop: 10, fontWeight: "600" },
});
