import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import type { WebViewErrorEvent, WebViewHttpErrorEvent } from "react-native-webview/lib/WebViewTypes";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "PayWeb">;

export default function PayWebScreen({ route, navigation }: Props) {
  const { url, orderId } = route.params;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    navigation.setOptions({ title: "Payment" });
  }, [navigation]);

  const handleNavChange = useCallback(
    (nav: WebViewNavigation) => {
      // Stripe redirects to /deliver/success/[orderId] on completion.
      if (
        nav.url.includes("/deliver/success/") ||
        nav.url.includes("/deliver/checkout/success") ||
        nav.url.includes(`order_id=${orderId}`)
      ) {
        navigation.replace("OrderSuccess", { orderId });
      }
      // Cancel path
      if (
        nav.url.includes("/deliver/checkout/cancel") ||
        nav.url.includes("checkout=cancelled")
      ) {
        Alert.alert(
          "Payment cancelled",
          "Your cart is still saved if you want to try again.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    },
    [navigation, orderId]
  );

  const handleError = useCallback((e: WebViewErrorEvent) => {
    setLoading(false);
    const desc = e.nativeEvent.description || "Couldn't reach the payment page.";
    setLoadError(desc);
  }, []);

  const handleHttpError = useCallback((e: WebViewHttpErrorEvent) => {
    setLoading(false);
    setLoadError(`Payment page returned ${e.nativeEvent.statusCode}.`);
  }, []);

  const retry = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  if (loadError) {
    return (
      <View style={styles.errorWrap}>
        <Ionicons name="cloud-offline-outline" size={42} color={colors.coral[600]} />
        <Text style={styles.errorTitle}>Couldn&apos;t load payment</Text>
        <Text style={styles.errorBody}>
          {loadError}{"\n\n"}Your cart is still saved.
        </Text>
        <View style={styles.errorActions}>
          <TouchableOpacity style={styles.retryBtn} onPress={retry} accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Back to cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        key={reloadKey}
        source={{ uri: url }}
        onNavigationStateChange={handleNavChange}
        onLoadEnd={() => setLoading(false)}
        onError={handleError}
        onHttpError={handleHttpError}
        decelerationRate="normal"
        sharedCookiesEnabled
      />
      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.coral[500]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  loader: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sand[50],
  },
  errorWrap: {
    flex: 1,
    backgroundColor: colors.sand[50],
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.navy[900],
  },
  errorBody: {
    fontSize: 14,
    color: colors.navy[400],
    textAlign: "center",
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.coral[500],
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sand[300],
  },
  cancelText: { color: colors.navy[700], fontWeight: "600", fontSize: 14 },
});
