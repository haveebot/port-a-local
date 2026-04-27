import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  NavigationContainerRef,
  DefaultTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";

import HomeScreen from "./src/screens/HomeScreen";
import CategoryScreen from "./src/screens/CategoryScreen";
import BusinessScreen from "./src/screens/BusinessScreen";
import ServicesHubScreen from "./src/screens/ServicesHubScreen";
import ServiceWebScreen from "./src/screens/ServiceWebScreen";
import SearchScreen from "./src/screens/SearchScreen";
import AccountScreen from "./src/screens/AccountScreen";
import DeliverHomeScreen from "./src/screens/DeliverHomeScreen";
import RestaurantScreen from "./src/screens/RestaurantScreen";
import CartScreen from "./src/screens/CartScreen";
import CheckoutScreen from "./src/screens/CheckoutScreen";
import PayWebScreen from "./src/screens/PayWebScreen";
import OrderSuccessScreen from "./src/screens/OrderSuccessScreen";
import MaintenanceFormScreen from "./src/screens/MaintenanceFormScreen";
import MaintenanceConfirmedScreen from "./src/screens/MaintenanceConfirmedScreen";
import RentFormScreen from "./src/screens/RentFormScreen";
import BeachFormScreen from "./src/screens/BeachFormScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import OrderDetailScreen from "./src/screens/OrderDetailScreen";
import FishingReportScreen from "./src/screens/FishingReportScreen";
import LocalsScreen from "./src/screens/LocalsScreen";

import { registerForPushNotificationsAsync } from "./src/lib/notifications";
import { CartProvider } from "./src/lib/cart";
import { colors } from "./src/lib/theme";
import {
  BrowseStackParamList,
  ServicesStackParamList,
  AccountStackParamList,
  RootTabParamList,
} from "./src/lib/navigation";

const Tab = createBottomTabNavigator<RootTabParamList>();
const BrowseStack = createNativeStackNavigator<BrowseStackParamList>();
const ServicesStack = createNativeStackNavigator<ServicesStackParamList>();
const SearchStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();

const stackHeader = {
  headerStyle: { backgroundColor: colors.navy[950] },
  headerTintColor: colors.sand[50],
  headerTitleStyle: { fontWeight: "700" as const, letterSpacing: 0.5 },
  headerShadowVisible: false,
};

function BrowseStackNav() {
  return (
    <BrowseStack.Navigator screenOptions={stackHeader}>
      <BrowseStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <BrowseStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ title: "Category" }}
      />
      <BrowseStack.Screen
        name="Business"
        component={BusinessScreen}
        options={{ title: "" }}
      />
    </BrowseStack.Navigator>
  );
}

function ServicesStackNav() {
  return (
    <ServicesStack.Navigator screenOptions={stackHeader}>
      <ServicesStack.Screen
        name="ServicesHub"
        component={ServicesHubScreen}
        options={{ headerShown: false }}
      />
      <ServicesStack.Screen
        name="Service"
        component={ServiceWebScreen}
        options={{ title: "" }}
      />
      <ServicesStack.Screen
        name="DeliverHome"
        component={DeliverHomeScreen}
        options={{ title: "Delivery" }}
      />
      <ServicesStack.Screen
        name="Restaurant"
        component={RestaurantScreen}
        options={{ title: "" }}
      />
      <ServicesStack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Your Cart" }}
      />
      <ServicesStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: "Checkout" }}
      />
      <ServicesStack.Screen
        name="PayWeb"
        component={PayWebScreen}
        options={{ title: "Payment" }}
      />
      <ServicesStack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{ title: "Order Placed" }}
      />
      <ServicesStack.Screen
        name="MaintenanceForm"
        component={MaintenanceFormScreen}
        options={{ title: "Request Maintenance" }}
      />
      <ServicesStack.Screen
        name="MaintenanceConfirmed"
        component={MaintenanceConfirmedScreen}
        options={{ title: "Request Sent" }}
      />
      <ServicesStack.Screen
        name="RentForm"
        component={RentFormScreen}
        options={{ title: "Reserve Golf Cart" }}
      />
      <ServicesStack.Screen
        name="BeachForm"
        component={BeachFormScreen}
        options={{ title: "Beach Gear" }}
      />
      <ServicesStack.Screen
        name="Locals"
        component={LocalsScreen}
        options={{ title: "Locals" }}
      />
      <ServicesStack.Screen
        name="FishingReport"
        component={FishingReportScreen}
        options={{ title: "Fishing Report" }}
      />
    </ServicesStack.Navigator>
  );
}

function SearchStackNav() {
  return (
    <SearchStack.Navigator screenOptions={stackHeader}>
      <SearchStack.Screen
        name="SearchHome"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
    </SearchStack.Navigator>
  );
}

function AccountStackNav() {
  return (
    <AccountStack.Navigator screenOptions={stackHeader}>
      <AccountStack.Screen
        name="AccountHome"
        component={AccountScreen}
        options={{ headerShown: false }}
      />
      <AccountStack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: "My Orders" }}
      />
      <AccountStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Order" }}
      />
    </AccountStack.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.sand[50],
    primary: colors.coral[500],
  },
};

const linking = {
  prefixes: [
    Linking.createURL("/"),
    "https://port-a-local.vercel.app",
    "https://theportalocal.com",
    "portalocal://",
  ],
  config: {
    screens: {
      Browse: {
        screens: {
          Home: "",
          Category: ":slug",
          Business: ":category/:slug",
        },
      },
      Services: {
        screens: {
          ServicesHub: "services",
          Service: "service/:slug",
        },
      },
      Search: "search",
      Account: {
        screens: {
          AccountHome: "account",
          Orders: "orders",
          OrderDetail: "orders/:orderId",
        },
      },
    },
  },
};

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<RootTabParamList> | null>(
    null
  );
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(
    null
  );

  // When a notification's data has { orderId } or { restaurantSlug } or
  // { serviceSlug }, route into the right screen. Backend just needs to
  // include one of these fields in the push payload's data object.
  const routeFromNotification = (
    data: Record<string, unknown> | undefined
  ) => {
    if (!data || !navigationRef.current) return;
    const orderId =
      typeof data.orderId === "string" ? data.orderId : undefined;
    const restaurantSlug =
      typeof data.restaurantSlug === "string"
        ? data.restaurantSlug
        : undefined;
    const serviceSlug =
      typeof data.serviceSlug === "string" ? data.serviceSlug : undefined;

    if (orderId) {
      navigationRef.current.navigate("Account", {
        screen: "OrderDetail",
        params: { orderId },
      });
      return;
    }
    if (restaurantSlug) {
      navigationRef.current.navigate("Services", {
        screen: "Restaurant",
        params: { slug: restaurantSlug },
      });
      return;
    }
    if (serviceSlug) {
      navigationRef.current.navigate("Services", {
        screen: "Service",
        params: { slug: serviceSlug as never },
      });
    }
  };

  useEffect(() => {
    (async () => {
      await registerForPushNotificationsAsync().catch(() => null);
      // Cold-start: app was launched by tapping a notification.
      const last = await Notifications.getLastNotificationResponseAsync();
      if (last) {
        routeFromNotification(last.notification.request.content.data);
      }
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {});

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        routeFromNotification(response.notification.request.content.data);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <CartProvider>
      <StatusBar style="light" />
      <NavigationContainer ref={navigationRef} theme={navTheme} linking={linking}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.coral[500],
            tabBarInactiveTintColor: colors.navy[300],
            tabBarStyle: {
              backgroundColor: colors.navy[950],
              borderTopColor: colors.navy[800],
              paddingBottom: 4,
            },
            tabBarLabelStyle: { fontWeight: "600", fontSize: 11 },
          }}
        >
          <Tab.Screen
            name="Browse"
            component={BrowseStackNav}
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="compass" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Services"
            component={ServicesStackNav}
            options={{
              title: "Order",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bag-handle" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Search"
            component={SearchStackNav}
            options={{
              title: "Search",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Account"
            component={AccountStackNav}
            options={{
              title: "Account",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-circle" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
