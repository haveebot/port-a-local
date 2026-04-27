import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

import TasksScreen from "./src/screens/TasksScreen";
import MyTasksScreen from "./src/screens/MyTasksScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { getApiUrl } from "./src/lib/storage";
import { setApiBase } from "./src/lib/api";
import { registerForPushNotificationsAsync } from "./src/lib/notifications";
import { getWorkerId } from "./src/lib/storage";
import { registerPushToken } from "./src/lib/api";

const Tab = createBottomTabNavigator();

export default function App() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(
    null
  );

  useEffect(() => {
    // Restore API URL from storage
    (async () => {
      const savedUrl = await getApiUrl();
      if (savedUrl) setApiBase(savedUrl);

      // Re-register push token on every launch (tokens can rotate)
      const workerId = await getWorkerId();
      if (workerId) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          try {
            await registerPushToken(workerId, token);
          } catch {
            // Server might not be reachable yet
          }
        }
      }
    })();

    // Listen for incoming notifications while app is open
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    // Listen for user tapping on a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: "#0369a1",
            tabBarInactiveTintColor: "#94a3b8",
            tabBarStyle: {
              backgroundColor: "#fff",
              borderTopColor: "#e2e8f0",
              paddingBottom: 4,
            },
            headerStyle: { backgroundColor: "#0c4a6e" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "700" },
          }}
        >
          <Tab.Screen
            name="Tasks"
            component={TasksScreen}
            options={{
              title: "Available Tasks",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list-circle" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="MyTasks"
            component={MyTasksScreen}
            options={{
              title: "My Tasks",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="checkmark-circle" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: "Settings",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
