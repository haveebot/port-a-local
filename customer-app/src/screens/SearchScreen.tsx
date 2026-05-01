import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../lib/theme";
import { businesses, Business } from "@palocal/data/businesses";
import { categories } from "@palocal/data/categories";

const RECENT_SEARCHES_KEY = "pal-recent-searches-v1";

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
  const [query, setQuery] = useState(""); // Current search input
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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

  // --- Persistence Logic ---
  const updateRecentSearches = useCallback(async (newQuery: string) => {
    if (!newQuery) return;

    let currentSearches: string[] = [];
    try {
      const raw = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);
      if (raw) {
        currentSearches = JSON.parse(raw) as string[];
      }
    } catch (e) {
      console.error("Failed to load recent searches:", e);
    }

    // 1. Filter out the current query if it already exists
    const filteredSearches = currentSearches.filter(s => s !== newQuery);

    // 2. Build the new list: [newQuery, ...filteredSearches]
    const updatedSearches = [newQuery, ...filteredSearches];

    // 3. Ensure uniqueness and limit to 5
    const uniqueSearches = Array.from(new Set(updatedSearches)).slice(0, 5);

    // 4. Persist and update state
    await SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(uniqueSearches));
    setRecentSearches(uniqueSearches);
  }, []);

  // Load recent searches on mount (Improvement)
  useEffect(() => {
    updateRecentSearches("");
  }, [updateRecentSearches]);

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
            onChangeText={(text) => {
              setQuery(text);
            }}
            placeholder="Gully it..."
            placeholderTextColor={colors.navy[300]}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => updateRecentSearches(query)} // Bug 2 fix: Update on submit
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
              {/* Use recent searches if available, otherwise use static suggestions */}
              {(recentSearches.length > 0 ? recentSearches : SUGGESTIONS).map((s) => (
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
                  // Bug 2 fix: Update recent searches on navigation
                  updateRecentSearches(query);
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
                <Ionicons name="search-outline" size={50} color={colors.navy[300]} />
                <Text style={styles.emptyTitle}>No results found for "{q}"</Text>
                <Text style={styles.emptyText}>
                  We couldn't find any businesses matching "{q}".
                  Try broadening your search, checking spelling, or browsing a category above.
                </Text>
                <TouchableOpacity 
                  onPress={() => setQuery("")} 
                  style={{ marginTop: 15 }}
                >
                  <Text style={styles.emptyLink}>Clear search</Text>
                </TouchableOpacity>
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
  emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.navy[700], marginBottom: 8 },
  emptyText: { color: colors.navy[400], textAlign: "center", lineHeight: 22, fontSize: 14 },
  emptyLink: { 
    color: colors.coral[500], 
    fontWeight: "600", 
    marginTop: 5 
  }
});
