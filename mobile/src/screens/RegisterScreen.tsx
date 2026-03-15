import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { step1Schema, step2Schema } from "../schemas/authSchemas";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const RESERVED = ["admin", "root", "superuser"];

export const RegisterScreen = ({ navigation }: Props) => {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [data, setData] = useState({ email: "", username: "", password: "", occupation: "", company: "", githubUrl: "" });

  const schema = useMemo(() => (step === 1 ? step1Schema : step2Schema), [step]);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const next1 = async (values: any) => {
    if (RESERVED.includes(String(values.username).toLowerCase())) {
      setError("Username not available");
      return;
    }
    setError("");
    setData((prev) => ({ ...prev, ...values }));
    setStep(2);
  };

  const next2 = (values: any) => {
    setData((prev) => ({ ...prev, ...values }));
    setStep(3);
  };

  const submit = async () => {
    await register({ username: data.username, email: data.email, password: data.password });
    navigation.navigate("Login");
  };

  return (
    <Screen>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>ShopSync Register</Text>
        <Text style={[styles.step, { color: colors.muted }]}>Step {step} of 3</Text>

        {step === 1 && (
          <>
            <LabeledInput label="Email" name="email" control={control} colors={colors} error={errors.email?.message} autoCapitalize="none" />
            <LabeledInput label="Username" name="username" control={control} colors={colors} error={errors.username?.message} />
            <LabeledInput label="Password" name="password" control={control} colors={colors} error={errors.password?.message} secureTextEntry />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <PrimaryButton title={isSubmitting ? "Checking..." : "Next"} onPress={handleSubmit(next1)} color={colors.primary} />
          </>
        )}

        {step === 2 && (
          <>
            <LabeledInput label="Occupation" name="occupation" control={control} colors={colors} error={errors.occupation?.message} />
            <LabeledInput label="Company" name="company" control={control} colors={colors} error={errors.company?.message} />
            <LabeledInput label="GitHub URL (optional)" name="githubUrl" control={control} colors={colors} error={errors.githubUrl?.message} autoCapitalize="none" />
            <View style={styles.row}>
              <PrimaryButton title="Back" onPress={() => setStep(1)} color="#6B7280" />
              <PrimaryButton title="Next" onPress={handleSubmit(next2)} color={colors.primary} />
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <View style={[styles.summary, { borderColor: colors.border }]}> 
              <Text style={{ color: colors.text }}>Email: {data.email}</Text>
              <Text style={{ color: colors.text }}>Username: {data.username}</Text>
              <Text style={{ color: colors.text }}>Occupation: {data.occupation}</Text>
              <Text style={{ color: colors.text }}>Company: {data.company}</Text>
              {!!data.githubUrl && <Text style={{ color: colors.text }}>GitHub: {data.githubUrl}</Text>}
            </View>
            <View style={styles.row}>
              <PrimaryButton title="Back" onPress={() => setStep(2)} color="#6B7280" />
              <PrimaryButton title="Create Account" onPress={submit} color={colors.primary} />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
};

const LabeledInput = ({ label, name, control, colors, error, ...rest }: any) => (
  <>
    <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TextInput
          {...rest}
          value={value}
          onChangeText={onChange}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholderTextColor={colors.muted}
        />
      )}
    />
    {!!error && <Text style={styles.error}>{error}</Text>}
  </>
);

const PrimaryButton = ({ title, onPress, color }: { title: string; onPress: () => void; color: string }) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor: color }]}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  step: { textAlign: "center", marginBottom: 8 },
  label: { fontWeight: "600", marginTop: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  error: { color: "#DC2626", fontSize: 12 },
  summary: { borderWidth: 1, borderRadius: 8, padding: 12, gap: 6 },
  row: { flexDirection: "row", gap: 8 },
  button: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 12, marginTop: 8, flex: 1 },
  buttonText: { color: "#FFFFFF", textAlign: "center", fontWeight: "700" },
});
