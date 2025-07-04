import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "./assets/styles/global.css";
import Tabs from "./src/components/Navigation/Tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { UserProvider } from "./src/context/AuthContext";
import { enableScreens } from "react-native-screens";
enableScreens();
import { NotificationProvider } from "./src/context/NotificationContext";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import FlashMessage, {
  showMessage,
  hideMessage,
} from "react-native-flash-message";
import { NetworkProvider, useNetwork } from "./src/context/networkContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { VehicleDataProvider } from "./src/context/VehicleDataContext";
import { NavigationModeProvider } from "./src/context/NavigationModeContext";
import { navigationRef } from "./src/components/Navigation/NavigationService";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/containers/SplashScreen";
import AppQueryProvider from "./src/providers/QueryClientProvider";
import * as Linking from "expo-linking";

function NetworkBanner() {
  const { isConnected } = useNetwork();

  React.useEffect(() => {
    if (!isConnected) {
      showMessage({
        message: "Aucune connexion internet détectée.",
        type: "danger",
        icon: "auto",
        duration: 10000, // durée longue, mais on va le garder tant que pas de réseau
        floating: true,
        autoHide: false,
      });
    } else {
      hideMessage();
    }
  }, [isConnected]);

  return null;
}

export default function App() {
  // ExpoSplashScreen.setOptions( { fade:true, duration: 6000 });

  const Stack = createNativeStackNavigator();

  const [isLoading, setIsLoading] = useState(true);
  const RootNavigator = () => {
    const onAnimationFinish = () => {
      setIsLoading(false);
    };

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 6000); // Simule un chargement de 6 secondes
      return () => clearTimeout(timer);
    }, []);

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen
            name="SplashScreen"
            options={{
              navigationBarHidden: true,
            }}
            // Passe la prop ici
            children={() => (
              <SplashScreen onAnimationFinish={onAnimationFinish} />
            )}
          />
        ) : (
          <Stack.Screen
            name="MainApp"
            component={Tabs}
            options={{
              navigationBarHidden: true,
            }}
          />
        )}
      </Stack.Navigator>
    );
  };

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

  const linking = {
    prefixes: [
      "jolt://",
      `${process.env.EXPO_URL_JOLT_WEBSITE_SCHEME}://${process.env.EXPO_URL_JOLT_WEBSITE_HOST}:${process.env.EXPO_URL_JOLT_WEBSITE_PORT}`,
      Linking.createURL("/"),
    ],
    config: {
      screens: {
        MainApp: {
          screens: {
            RouteTraveledNavigator: {
              screens: {
                TravelScreen: "travel",
                TrackingDetailsScreen: {
                  path: "navigate/trip/:tripId", // Format avec paramètre
                  parse: {
                    tripId: (tripId) => tripId,
                  },
                },
              },
            },
          },
        },
        // Gère aussi les URLs avec query parameters
        "*": "maps", // Fallback pour toutes les autres URLs
      },
    },
    // Gère les URLs avec query parameters
    subscribe(listener) {
      const onReceiveURL = ({ url }) => {
        console.log("Deep link received:", url);

        // Gère les URLs avec query parameters comme ?id=...
        if (url.includes("navigate/trip?id=")) {
          const urlObj = new URL(url);
          const tripId = urlObj.searchParams.get("id");
          if (tripId) {
            // Convertit en format standard
            const newUrl = url.replace(
              /navigate\/trip\?id=(.+)/,
              "navigate/trip/$1"
            );
            listener(newUrl);
            return;
          }
        }

        listener(url);
      };

      // Écoute les liens entrants
      const subscription = Linking.addEventListener("url", onReceiveURL);

      return () => {
        subscription?.remove();
      };
    },
  };

  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <NetworkProvider>
          <NetworkBanner />
          <AppQueryProvider>
            <UserProvider>
              <VehicleDataProvider>
                <NavigationModeProvider>
                  <NavigationContainer ref={navigationRef} linking={linking}>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <StatusBar />
                      <RootNavigator />
                    </GestureHandlerRootView>
                  </NavigationContainer>
                </NavigationModeProvider>
              </VehicleDataProvider>
            </UserProvider>
          </AppQueryProvider>
          <FlashMessage position="top" />
        </NetworkProvider>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}
