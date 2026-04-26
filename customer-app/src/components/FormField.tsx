import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { colors } from "../lib/theme";

interface FormFieldProps extends TextInputProps {
  label: string;
  hint?: string;
}

export default function FormField({
  label,
  hint,
  style,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.navy[300]}
        style={[
          styles.input,
          inputProps.multiline && styles.inputMulti,
          style,
        ]}
        {...inputProps}
      />
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.navy[700],
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.sand[50],
    borderWidth: 1,
    borderColor: colors.sand[200],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.navy[900],
  },
  inputMulti: { minHeight: 80, textAlignVertical: "top" },
  hint: { fontSize: 12, color: colors.navy[400], marginTop: 6 },
});
