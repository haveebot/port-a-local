import React, { useCallback, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import { ServicesStackParamList } from "../lib/navigation";

type Props = NativeStackScreenProps<ServicesStackParamList, "PayWeb">;

export default function PayWebScreen({ route, navigation }: Props) {
  const { url, orderId } = route.params;
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
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

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={handleNavChange}
        onLoadEnd={() => setLoading(false)}
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
});
