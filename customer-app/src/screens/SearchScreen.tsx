import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../lib/theme";
import { businesses, Business } from "@palocal/data/businesses";
import { categories } from "@palocal/data/categories";

const SUGGESTIONS = [
  "fish tacos",
  "happy hour",
  "Farley",
  "sunset",
  "pet friendly",
  "live music",
  "kids",
];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const results: Business[] = q
    ? businesses
        .filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.tagline.toLowerCase().includes(q) ||
            b.description.toLowerCase().includes(q) ||
            b.tags?.some((t) => t.toLowerCase().includes(q)) ||
            b.category.toLowerCase().includes(q)
        )
        .slice(0, 25)
    : [];

  const showSuggestions = q.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>JUST GULLY IT</Text>
        <Text style={styles.title}>Search the island</Text>
        <View style={styles.coralLine} />

        <View style={styles.searchRow}>
          <Ionicons
            name="search"
            size={18}
            color={colors.navy[400]}
            style={{ marginLeft: 12 }}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Gully it..."
            placeholderTextColor={colors.navy[300]}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.navy[300]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.body}
      >
        {showSuggestions && (
          <>
            <Text style={styles.sectionLabel}>Try</Text>
            <View style={styles.chips}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.chip}
                  onPress={() => setQuery(s)}
                >
                  <Text style={styles.chipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
              Or browse a category
            </Text>
            <View style={styles.catList}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.slug}
                  style={styles.catRow}
                  onPress={() =>
                    navigation
                      .getParent()
                      ?.navigate("Browse", {
                        screen: "Category",
                        params: { slug: c.slug },
                      })
                  }
                >
                  <Text style={styles.catIcon}>{c.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catName}>{c.name}</Text>
                    <Text style={styles.catDesc} numberOfLines={1}>
                      {c.description}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.navy[300]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {!showSuggestions && (
          <>
            <Text style={styles.sectionLabel}>
              {results.length} {results.length === 1 ? "result" : "results"}
            </Text>
            {results.map((b) => (
              <TouchableOpacity
                key={b.slug}
                style={styles.resultRow}
                onPress={() => {
                  Keyboard.dismiss();
                  navigation
                    .getParent()
                    ?.navigate("Browse", {
                      screen: "Business",
                      params: { slug: b.slug, preview: b },
                    });
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{b.name}</Text>
                  <Text style={styles.resultMeta} numberOfLines={1}>
                    {b.category.toUpperCase()} · {b.tagline}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.navy[300]}
                />
              </TouchableOpacity>
            ))}
            {results.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  Nothing matched. Try a category or one of the suggestions
                  above.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand[200],
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    fontFamily: "Georgia",
    color: colors.navy[900],
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  coralLine: {
    height: 1,
    width: 56,
    backgroundColor: colors.coral[500],
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.sand[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sand[200],
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.navy[900],
  },
  body: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy[500],
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.sand[200],
  },
  chipText: { color: colors.navy[800], fontSize: 13, fontWeight: "600" },
  catList: { gap: 8 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sand[200],
  },
  catIcon: { fontSize: 22, marginRight: 12 },
  catName: { fontSize: 15, fontWeight: "700", color: colors.navy[900] },
  catDesc: { fontSize: 12, color: colors.navy[400] },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand[200],
  },
  resultName: { fontSize: 15, fontWeight: "700", color: colors.navy[900] },
  resultMeta: { fontSize: 12, color: colors.navy[500], marginTop: 2 },
  empty: { padding: 30, alignItems: "center" },
  emptyText: { color: colors.navy[400], textAlign: "center", lineHeight: 20 },
});
