import React, { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

type FieldConfig = {
  name: string;
  label?: string;
  type: "text" | "number" | "select" | "checkbox" | "group";
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
  showIf?: Record<string, any>;
  fields?: FieldConfig[];
};

const buildSchema = (fields: FieldConfig[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (field.type === "group") {
      shape[field.name] = buildSchema(field.fields || []);
      continue;
    }
    if (field.type === "checkbox") {
      let s = z.boolean();
      if (field.required) s = s.refine((v) => v === true, { message: `${field.label || field.name} is required` });
      shape[field.name] = s;
      continue;
    }
    if (field.type === "number") {
      let s = z.coerce.number();
      if (field.min !== undefined) s = s.min(field.min);
      if (field.max !== undefined) s = s.max(field.max);
      shape[field.name] = field.required ? s : s.optional();
      continue;
    }
    let s = z.string();
    if (field.required) {
      s = s.min(field.min || 1, `${field.label || field.name} is required`);
      if (field.max) s = s.max(field.max);
      shape[field.name] = s;
    } else {
      if (field.min) s = s.min(field.min);
      if (field.max) s = s.max(field.max);
      shape[field.name] = s.optional().or(z.literal(""));
    }
  }
  return z.object(shape);
};

const getByPath = (obj: any, path: string) => path.split(".").reduce((acc, key) => acc?.[key], obj);

const FieldNode = ({ field, prefix, control, errors }: { field: FieldConfig; prefix: string; control: any; errors: any }) => {
  const { colors } = useTheme();
  const fullName = prefix ? `${prefix}.${field.name}` : field.name;
  const values = useWatch({ control });
  const label = field.label || field.name;

  if (field.showIf) {
    const ok = Object.entries(field.showIf).every(([k, v]) => {
      const path = prefix ? `${prefix}.${k}` : k;
      return getByPath(values, path) === v;
    });
    if (!ok) return null;
  }

  if (field.type === "group") {
    return (
      <View style={[styles.group, { borderColor: colors.border }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>{label}</Text>
        {(field.fields || []).map((child) => (
          <FieldNode key={child.name} field={child} prefix={fullName} control={control} errors={errors?.[field.name] || {}} />
        ))}
      </View>
    );
  }

  const fieldError = prefix ? getByPath(errors, prefix)?.[field.name] : errors?.[field.name];

  return (
    <View style={styles.fieldWrap}>
      {field.type === "checkbox" ? (
        <Controller
          control={control}
          name={fullName}
          defaultValue={false}
          render={({ field: f }) => (
            <Pressable onPress={() => f.onChange(!f.value)} style={styles.checkboxRow}>
              <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: f.value ? colors.primary : "transparent" }]} />
              <Text style={{ color: colors.text }}>{label}</Text>
            </Pressable>
          )}
        />
      ) : (
        <>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          <Controller
            control={control}
            name={fullName}
            render={({ field: f }) => {
              if (field.type === "select") {
                return (
                  <View style={styles.selectWrap}>
                    {(field.options || []).map((opt) => {
                      const selected = f.value === opt;
                      return (
                        <Pressable
                          key={opt}
                          onPress={() => f.onChange(opt)}
                          style={[styles.option, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.card }]}
                        >
                          <Text style={{ color: selected ? "#FFFFFF" : colors.text }}>{opt}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                );
              }
              return (
                <TextInput
                  value={f.value === undefined || f.value === null ? "" : String(f.value)}
                  onChangeText={(txt) => f.onChange(field.type === "number" ? Number(txt) : txt)}
                  keyboardType={field.type === "number" ? "numeric" : "default"}
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholderTextColor={colors.muted}
                />
              );
            }}
          />
        </>
      )}
      {!!fieldError?.message && <Text style={styles.error}>{String(fieldError.message)}</Text>}
    </View>
  );
};

export const DynamicFormBuilder = ({
  fieldConfig,
  onSubmit,
}: {
  fieldConfig: FieldConfig[];
  onSubmit: (data: any) => void;
}) => {
  const { colors } = useTheme();
  const schema = useMemo(() => buildSchema(fieldConfig), [fieldConfig]);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {fieldConfig.map((f) => <FieldNode key={f.name} field={f} prefix="" control={control} errors={errors} />)}
      <Pressable onPress={handleSubmit(onSubmit)} style={[styles.submit, { backgroundColor: colors.primary }]} disabled={isSubmitting}>
        <Text style={styles.submitText}>{isSubmitting ? "Submitting..." : "Submit"}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  fieldWrap: { gap: 6 },
  label: { fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10 },
  selectWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: { borderWidth: 1, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 12 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderRadius: 4 },
  group: { borderWidth: 1, borderRadius: 10, padding: 10, gap: 8 },
  groupTitle: { fontWeight: "700" },
  error: { color: "#DC2626", fontSize: 12 },
  submit: { borderRadius: 8, paddingVertical: 12, marginTop: 8 },
  submitText: { textAlign: "center", color: "#FFFFFF", fontWeight: "700" },
});
