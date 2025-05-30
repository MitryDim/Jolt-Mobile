import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "./assets/styles/global.css";
import Tabs from "./src/components/Navigation/Tabs";
 import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { UserProvider } from "./src/context";
import { enableScreens } from "react-native-screens";
enableScreens();
import { NotificationProvider } from "./src/context/NotificationContext";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
export default function App() {
  // ExpoSplashScreen.setOptions( { fade:true, duration: 6000 });
  const [isLoaded] = useFonts({
    Navigation: require("./assets/fonts/Navigation.ttf"),
  });

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND_NOTIFICATION_TASK";

  TaskManager.defineTask(
    BACKGROUND_NOTIFICATION_TASK,
    async ({ data, error }) => {
      if (error) {
        console.error("Error in background notification task:", error);
        return;
      }
      if (data) {
        const notification = data.notification;
        console.log("Received background notification:", notification);
      }
    }
  );

  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
    // This task will run in the background when a notification is received
    // while the app is in the background or terminated.
    // You can specify options here if needed.
  });

  return (
    <NotificationProvider>
    <UserProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar />
         <Tabs /> 
        </NavigationContainer>
      </SafeAreaProvider>
    </UserProvider>
    </NotificationProvider>
  );
}
