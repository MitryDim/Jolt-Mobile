import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "./assets/styles/global.css";
import Tabs from "./src/components/Navigation/Tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";


export default function App() {
   const [isLoaded] = useFonts({
     Navigation: require("./assets/fonts/Navigation.ttf"),
   });
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar />
        <Tabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
