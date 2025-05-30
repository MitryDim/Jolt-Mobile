import { View, Text, Button, Platform, AppState } from "react-native";
import * as Linking from "expo-linking";
import React,{useEffect,useRef} from "react";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";

import CustomButton from "../components/CustomButton";
const pkg = Constants.expoConfig.releaseChannel
  ? Constants.expoConfig.android.package // When published, considered as using standalone build
  : 'host.exp.exponent'; // In expo client mode


const PermissionScreen = () => {
     const appState = useRef(AppState.currentState);

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = async (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        console.log("Permission to access location was granted");
      }
    }

    appState.current = nextAppState;
  };

  const open_settings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL(`app-settings:`);
    } else {
     startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
       data: "package:" + pkg,
     });
    }
  };

  return (
    <View className="flex-1 bg-[#70E575] justify-center items-center">
      <Text>PermissionScreen</Text>
      <CustomButton
        title="Ask for permission"
        onPress={() => {
          open_settings();
        }}
      />
    </View>
  );
};

export default PermissionScreen;
