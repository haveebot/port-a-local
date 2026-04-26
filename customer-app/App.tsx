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

import { registerForPushNotificationsAsync } from "./src/lib/notifications";
import { CartProvider } from "./src/lib/cart";
import { colors } from "./src/lib/theme";
import {
  BrowseStackParamList,
  ServicesStackParamList,
  RootTabParamList,
} from "./src/lib/navigation";

const Tab = createBottomTabNavigator<RootTabParamList>();
const BrowseStack = createNativeStackNavigator<BrowseStackParamList>();
const ServicesStack = createNativeStackNavigator<ServicesStackParamList>();
const SearchStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

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
      Account: "account",
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

  useEffect(() => {
    (async () => {
      await registerForPushNotificationsAsync().catch(() => null);
      await Notifications.getLastNotificationResponseAsync();
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {});

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        // Future: route from notification.request.content.data
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
