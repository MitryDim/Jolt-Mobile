import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import * as ExpoSplashScreen from "expo-splash-screen";
import Navigation from "./src/containers/Navigation";
import { StatusBar } from "expo-status-bar";
import "./assets/styles/global.css";
// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  const appIsReady = useState(true);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await ExpoSplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View className="flex-1" onLayout={onLayoutRootView}>
      <StatusBar />
      <Navigation />
    </View>
  );
}
