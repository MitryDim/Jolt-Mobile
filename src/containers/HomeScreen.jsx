import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import React, {
  use,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SafeAreaView } from "react-native";
import Card from "../components/Cards";
import Separator from "../components/Separator";
import { useNotification } from "../context/NotificationContext";
import { useFocusEffect } from "@react-navigation/native";
import VehicleCarousel from "../components/VehicleCarousel";
import { useVehicleData } from "../context/VehicleDataContext";
import { UserContext } from "../context/AuthContext";
const CARD_WIDTH = Dimensions.get("window").width * 0.7;

import TripsCarousel from "../components/TripsCarousel";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
const HomeScreen = ({ navigation }) => {
  const tabBarHeight = useBottomTabBarHeight();
  const fetchWithAuth = useFetchWithAuth();
  const {
    expoPushToken,
    notification,
    error: notificationError,
  } = useNotification();
  const { vehicles, changeVehicle, fetchAndUpdateVehicles } = useVehicleData();
  const { user } = useContext(UserContext);
  const [lastTrips, setLastTrips] = useState([]);
  const [tripsShared, setTripsShared] = useState([]);
  const [nearbyRides, setNearbyRides] = useState([]);

  useFocusEffect(
    useCallback(() => {
      console.log("HomeScreen focus effect");
      if (user && user.id) {
        fetchAndUpdateVehicles();
        fetchLastTrips();
      }
      fetchTripsShared();
      fetchNearbyRides();
    }, [user])
  );

  const fetchNearbyRides = async () => {
    try {
      // Demande la permission et récupère la position
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setNearbyRides([]);
        return;
      }
      let loc = await Location.getLastKnownPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      });

      if (!loc) {
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      }
      // Appel API avec lat, lon, radius
      const { data, status: apiStatus } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate?lat=${loc.coords.latitude}&lon=${
          loc.coords.longitude
        }&radius=10&limit=5&excludeSelf=true&isGroup=true&startTime=${new Date().toISOString()}`,
        { method: "GET" }
      );

      if (apiStatus === 200 && data?.data?.navigations) {
        setNearbyRides(data.data.navigations || []);
      } else {
        setNearbyRides([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des rides proches:", error);
      setNearbyRides([]);
    }
  };

  const fetchTripsShared = async () => {
    try {
      const { data, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate?limit=5&excludeSelf=true&isGroup=false`,
        { method: "GET" }
      );
      if (status === 200 && data?.data?.navigations) {
        console.log("Trajets partagés récupérés:", data.data.navigations);
        setTripsShared(data?.data?.navigations || []);
      } else {
        setTripsShared([]);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des trajets partagés:",
        error
      );
      setTripsShared([]);
    }
  };

  const fetchLastTrips = async () => {
    try {
      const { data, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate?limit=5&owner=${user?.id}`,
        { method: "GET" },
        { protected: true }
      );
      if (status === 200 && data?.data?.navigations) {
        console.log("Derniers trajets récupérés:", data.data.navigations);
        setLastTrips(data?.data?.navigations || []);
      } else {
        setLastTrips([]);
      }
    } catch (error) {
      setLastTrips([]);
    }
  };

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);
    const item = vehicles[index];
    if (item && !item.add) {
      changeVehicle(item);
    }
  };

  {
    /* <View style={{ margin: 16 }}>
        <Text style={{ fontWeight: "bold" }}>Expo Push Token :</Text>
        <Text selectable numberOfLines={1} style={{ fontSize: 12 }}>
          {expoPushToken || "Aucun token"}
        </Text>
        <Text style={{ fontWeight: "bold", marginTop: 8 }}>
          Dernière notification :
        </Text>
        <Text style={{ fontSize: 12 }}>
          {notification
            ? JSON.stringify(notification.request.content, null, 2)
            : "Aucune notification reçue"}
        </Text>
      </View> */
  }
  return (
    <SafeAreaView className={`flex mb-[${tabBarHeight}px]`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 65 }}>
        {user && (
          <>
            <Text className="mt-4 text-xl text-center font-bold">
              Ton équipement
            </Text>
            <Separator />
            <VehicleCarousel
              items={vehicles}
              onCardPress={(item) =>
                navigation.navigate("VehicleDetail", { vehicle: item })
              }
              onAddPress={() => navigation.navigate("AddVehicle")}
              onMomentumScrollEnd={handleScrollEnd}
              styles={styles}
              navigation={navigation}
              onFavoriteChange={fetchAndUpdateVehicles}
              showAddCard={true}
            />

            <Text className="mt-4 text-xl text-center font-bold">
              Tes derniers trajets
            </Text>
            <Separator />
            {lastTrips.length === 0 ? (
              <Text className="text-center text-gray-500">
                Tu n'as pas encore enregistré de trajet 😕
              </Text>
            ) : (
              <TripsCarousel trips={lastTrips} navigation={navigation} />
            )}
          </>
        )}
        <Text className="mt-4 text-xl text-center font-bold">
          Trajets partagés par la communauté
        </Text>
        <Separator />
        {tripsShared.length !== 0 ? (
          <TripsCarousel trips={tripsShared} navigation={navigation} />
        ) : (
          <Text className="text-center text-gray-500">
            Aucun trajet partagé pour le moment 😕
          </Text>
        )}

        <Text className="mt-4 text-xl text-center font-bold">
          Rides proches de toi à venir
        </Text>
        <Separator />
        {nearbyRides.length !== 0 ? (
          <TripsCarousel trips={nearbyRides} navigation={navigation} />
        ) : (
          <Text className="text-center text-gray-500">
            Aucun ride à venir proche de toi pour le moment 😕
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  image: {
    flex: 0.6,
    width: "100%",
  },
  column: {
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default HomeScreen;
