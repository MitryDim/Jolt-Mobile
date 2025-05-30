import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Linking,
  Platform,
  AppState,
} from "react-native";
import * as Location from "expo-location";
import * as IntentLauncher from "expo-intent-launcher";
import * as Application from "expo-application";

const LocationPermissionWrapper = ({ children }) => {
  const [hasLocationPermission, setHasLocationPermission] = useState(null);

  const checkLocationPermission = async () => {
    let { status } = await Location.getForegroundPermissionsAsync();
    console.log("Location permission status", status);
    if (status === "granted") {
      setHasLocationPermission(true);
    } else {
      setHasLocationPermission(false);
    }
  };

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("Requested location permission status", status);
    if (status === "granted") {
      setHasLocationPermission(true);
    } else {
      setHasLocationPermission(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
   checkLocationPermission()

  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        requestLocationPermission();
      }
    });

    return () => subscription.remove();
  }, []);

  const handleOpenSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        {
          data: "package:" + Application.applicationId,
        }
      );
    }
  };

  if (hasLocationPermission === false) {
    return (
      <View style={styles.fullScreen}>
        <Text>La permission de localisation n'a pas été accordée.</Text>
        <Button title="Ouvrir les paramètres" onPress={handleOpenSettings} />
      </View>
    );
  }

  if (hasLocationPermission === null) {
    return (
      <View style={styles.fullScreen}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});

export default LocationPermissionWrapper;
