import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

import TasksScreen from "./src/screens/TasksScreen";
import MyTasksScreen from "./src/screens/MyTasksScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import TaskDetailScreen from "./src/screens/TaskDetailScreen";
import { getApiUrl, getWorkerId } from "./src/lib/storage";
import { setApiBase, registerPushToken } from "./src/lib/api";
import { registerForPushNotificationsAsync } from "./src/lib/notifications";
import { colors } from "./src/lib/theme";
import {
  TasksStackParamList,
  MyTasksStackParamList,
  RootTabParamList,
} from "./src/lib/navigation";

const Tab = createBottomTabNavigator<RootTabParamList>();
const TasksStack = createNativeStackNavigator<TasksStackParamList>();
const MyTasksStack = createNativeStackNavigator<MyTasksStackParamList>();

const stackHeader = {
  headerStyle: { backgroundColor: colors.navy[950] },
  headerTintColor: colors.sand[50],
  headerTitleStyle: { fontWeight: "700" as const, letterSpacing: 0.5 },
};

function TasksStackNav() {
  return (
    <TasksStack.Navigator screenOptions={stackHeader}>
      <TasksStack.Screen
        name="TasksList"
        component={TasksScreen}
        options={{ title: "Available Tasks" }}
      />
      <TasksStack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: "Task Details" }}
      />
    </TasksStack.Navigator>
  );
}

function MyTasksStackNav() {
  return (
    <MyTasksStack.Navigator screenOptions={stackHeader}>
      <MyTasksStack.Screen
        name="MyTasksList"
        component={MyTasksScreen}
        options={{ title: "My Tasks" }}
      />
      <MyTasksStack.Screen
        name="MyTaskDetail"
        component={TaskDetailScreen}
        options={{ title: "Task Details" }}
      />
    </MyTasksStack.Navigator>
  );
}

export default function App() {
  const navigationRef =
    useRef<NavigationContainerRef<RootTabParamList> | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(
    null
  );

  const navigateToTaskFromNotification = (
    data: Record<string, unknown> | undefined
  ) => {
    const taskId = typeof data?.taskId === "string" ? data.taskId : undefined;
    if (!taskId || !navigationRef.current) return;
    const acceptedBy =
      typeof data?.accepted_by === "string" ? data.accepted_by : null;
    if (acceptedBy) {
      navigationRef.current.navigate("MyTasks", {
        screen: "MyTaskDetail",
        params: { taskId },
      });
    } else {
      navigationRef.current.navigate("Tasks", {
        screen: "TaskDetail",
        params: { taskId },
      });
    }
  };

  useEffect(() => {
    (async () => {
      const savedUrl = await getApiUrl();
      if (savedUrl) setApiBase(savedUrl);

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

      // Handle the case where the app was launched by tapping a notification
      const lastResponse =
        await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        navigateToTaskFromNotification(
          lastResponse.notification.request.content.data
        );
      }
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // Foreground notification arrived; handler in notifications.ts shows the banner.
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        navigateToTaskFromNotification(
          response.notification.request.content.data
        );
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer ref={navigationRef}>
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
          }}
        >
          <Tab.Screen
            name="Tasks"
            component={TasksStackNav}
            options={{
              title: "Available",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list-circle" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="MyTasks"
            component={MyTasksStackNav}
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
              headerShown: true,
              headerStyle: { backgroundColor: colors.navy[950] },
              headerTintColor: colors.sand[50],
              headerTitleStyle: { fontWeight: "700", letterSpacing: 0.5 },
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
