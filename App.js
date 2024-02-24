import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "./assets/styles/global.css";
import Tabs from "./src/components/Navigation/Tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function App() {

  return (
      <SafeAreaProvider >
        <NavigationContainer >
          <StatusBar />
          <Tabs/>
        </NavigationContainer>
      </SafeAreaProvider>
  );
}
