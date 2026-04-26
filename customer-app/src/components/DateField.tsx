import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { colors } from "../lib/theme";

interface Props {
  label: string;
  /** "YYYY-MM-DD" or "" */
  value: string;
  onChange: (next: string) => void;
  minDate?: Date;
  hint?: string;
}

function fromIso(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function pretty(iso: string): string {
  const d = fromIso(iso);
  if (!d) return "Tap to pick a date";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DateField({
  label,
  value,
  onChange,
  minDate,
  hint,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const onPickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed" || !selectedDate) return;
    onChange(toIso(selectedDate));
  };

  const baseDate = fromIso(value) ?? minDate ?? new Date();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.field, !value && styles.fieldEmpty]}
        onPress={() => setShowPicker((s) => !s)}
        activeOpacity={0.85}
      >
        <Text style={[styles.value, !value && styles.valueEmpty]}>
          {pretty(value)}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={baseDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            minimumDate={minDate}
            onChange={onPickerChange}
            themeVariant="light"
          />
          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  field: {
    backgroundColor: colors.sand[50],
    borderWidth: 1,
    borderColor: colors.sand[200],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  fieldEmpty: { borderStyle: "dashed" },
  value: { fontSize: 15, color: colors.navy[900], fontWeight: "600" },
  valueEmpty: { color: colors.navy[400], fontWeight: "400" },
  pickerWrap: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sand[200],
    marginTop: 8,
    overflow: "hidden",
  },
  doneButton: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.sand[100],
    alignItems: "center",
  },
  doneButtonText: {
    color: colors.coral[600],
    fontWeight: "700",
    fontSize: 14,
  },
  hint: { fontSize: 12, color: colors.navy[400], marginTop: 6 },
});
