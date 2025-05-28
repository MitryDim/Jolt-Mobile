import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "./assets/styles/global.css";
import Tabs from "./src/components/Navigation/Tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { UserProvider } from "./src/context";
import messaging from "@react-native-firebase/messaging";

export default function App() {
  // ExpoSplashScreen.setOptions( { fade:true, duration: 6000 });
  const [isLoaded] = useFonts({
    Navigation: require("./assets/fonts/Navigation.ttf"),
  });

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  };

  useEffect(() => {
    if (requestUserPermission) {
      console.log("Requesting user permission for notifications...");
      messaging()
        .getToken()
        .then((token) => {
          console.log("FCM Token:", token);
        })
        .catch((error) => {
          console.error("Error getting FCM token:", error);
        });
    } else {
      console.log("User permission for notifications not granted.");
    }

    //getInitialNotification: When the application is opened from a quit state.
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
        }
      });

    //onNotificationOpenedApp: When the application is opened from a background state.
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
    });

    //register background handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log(
        "Message handled in the background!",
        remoteMessage.notification
      );
    });

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("A new FCM message arrived!", remoteMessage.notification);
    });

    return unsubscribe;
  }, []);
  return (
    <UserProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar />
          <Tabs />
        </NavigationContainer>
      </SafeAreaProvider>
    </UserProvider>
  );
}
