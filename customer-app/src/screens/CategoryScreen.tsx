import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { businesses, Business } from "@palocal/data/businesses";
import { getCategoryBySlug } from "@palocal/data/categories";
import { BrowseStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<BrowseStackParamList, "Category">;

export default function CategoryScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const category = getCategoryBySlug(slug);
  const items = useMemo(
    () => businesses.filter((b) => b.category === slug),
    [slug]
  );

  React.useEffect(() => {
    if (category) {
      navigation.setOptions({ title: category.name });
    }
  }, [category, navigation]);

  const renderBusiness = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("Business", { slug: item.slug, preview: item })
      }
    >
      {item.featured && <View style={styles.coralAccent} />}
      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{item.name}</Text>
          {item.verifiedPartner && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          )}
        </View>
        <Text style={styles.tagline} numberOfLines={2}>
          {item.tagline}
        </Text>
        <Text style={styles.meta}>{item.hours}</Text>
        {item.tags?.length > 0 && (
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {category && (
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>
            {items.length} {items.length === 1 ? "spot" : "spots"} on the island
          </Text>
          <Text style={styles.headerTitle}>{category.icon} {category.name}</Text>
          <View style={styles.coralLine} />
          <Text style={styles.headerSub}>{category.description}</Text>
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.slug}
        renderItem={renderBusiness}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No businesses listed yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.sand[200],
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.coral[500],
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.navy[900],
    marginBottom: 8,
  },
  coralLine: {
    height: 1,
    width: 56,
    backgroundColor: colors.coral[500],
    marginBottom: 10,
  },
  headerSub: { fontSize: 14, color: colors.navy[500], lineHeight: 20 },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.sand[200],
    shadowColor: colors.navy[950],
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  coralAccent: { height: 3, backgroundColor: colors.coral[500] },
  cardBody: { padding: 18 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: { fontSize: 17, fontWeight: "700", color: colors.navy[900], flex: 1 },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.gold[100],
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.gold[600],
    letterSpacing: 0.8,
  },
  tagline: {
    fontSize: 14,
    color: colors.navy[700],
    lineHeight: 20,
    marginBottom: 8,
  },
  meta: { fontSize: 12, color: colors.navy[400], marginBottom: 8 },
  tags: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.sand[100],
  },
  tagText: { fontSize: 11, color: colors.navy[700] },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: colors.navy[400] },
});
