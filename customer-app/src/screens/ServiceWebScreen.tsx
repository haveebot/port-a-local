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

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={onNavChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
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
});
