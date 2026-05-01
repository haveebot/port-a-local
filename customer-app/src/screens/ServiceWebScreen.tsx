import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import type { WebViewErrorEvent, WebViewHttpErrorEvent } from "react-native-webview/lib/WebViewTypes";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { ServicesStackParamList, SERVICES } from "../lib/navigation";
import { webUrl } from "../lib/config";

type Props = NativeStackScreenProps<ServicesStackParamList, "Service">;

export default function ServiceWebScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const service = SERVICES.find((s) => s.slug === slug);
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleError = useCallback((e: WebViewErrorEvent) => {
    setLoading(false);
    setLoadError(e.nativeEvent.description || "Couldn't load this page.");
  }, []);
  const handleHttpError = useCallback((e: WebViewHttpErrorEvent) => {
    if (e.nativeEvent.statusCode >= 500) {
      setLoading(false);
      setLoadError(`Server returned ${e.nativeEvent.statusCode}.`);
    }
  }, []);
  const retry = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  React.useEffect(() => {
    if (service) navigation.setOptions({ title: service.title });
  }, [service, navigation]);

  const onNavChange = useCallback((nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
  }, []);

  const handleShouldStartLoad = useCallback((req: { url: string }) => {
    const url = req.url;
    // Open external links (tel:, mailto:, off-domain) outside the app
    if (
      url.startsWith("tel:") ||
      url.startsWith("mailto:") ||
      url.startsWith("sms:")
    ) {
      Linking.openURL(url);
      return false;
    }
    return true;
  }, []);

  if (!service) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Unknown service.</Text>
      </View>
    );
  }

  const url = webUrl(service.webPath);

  if (loadError) {
    return (
      <View style={styles.errorWrap}>
        <Ionicons name="cloud-offline-outline" size={42} color={colors.coral[600]} />
        <Text style={styles.errorTitle}>Couldn&apos;t load {service.title}</Text>
        <Text style={styles.errorBody}>{loadError}</Text>
        <View style={styles.errorActions}>
          <TouchableOpacity style={styles.retryBtn} onPress={retry} accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        key={reloadKey}
        ref={webRef}
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={onNavChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onError={handleError}
        onHttpError={handleHttpError}
        decelerationRate="normal"
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
      />
      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.coral[500]} />
        </View>
      )}
      {canGoBack && (
        <TouchableOpacity
          style={styles.backFab}
          activeOpacity={0.85}
          onPress={() => webRef.current?.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
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
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.navy[400] },
  backFab: {
    position: "absolute",
    left: 16,
    bottom: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy[950],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.navy[950],
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  errorWrap: {
    flex: 1,
    backgroundColor: colors.sand[50],
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 14,
  },
  errorTitle: { fontSize: 18, fontWeight: "700", color: colors.navy[900], textAlign: "center" },
  errorBody: { fontSize: 14, color: colors.navy[400], textAlign: "center", lineHeight: 20 },
  errorActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, backgroundColor: colors.coral[500] },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.sand[300] },
  cancelText: { color: colors.navy[700], fontWeight: "600", fontSize: 14 },
});
