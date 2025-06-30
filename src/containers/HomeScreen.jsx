import {
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import Separator from "../components/Separator";
import VehicleCarousel from "../components/VehicleCarousel";
import TripsCarousel from "../components/TripsCarousel";

import { useVehicleData } from "../context/VehicleDataContext";
import { UserContext } from "../context/AuthContext";
import { useNavigateQuery } from "../queries/useNavigateQueries";

const CARD_WIDTH = Dimensions.get("window").width * 0.7;

const HomeScreen = ({ navigation }) => {
  const tabBarHeight = useBottomTabBarHeight();
  const { vehicles, changeVehicle, fetchAndUpdateVehicles } = useVehicleData();
  const { user } = useContext(UserContext);
  const [startTime, setStartTime] = useState(new Date().toISOString());

  const [location, setLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

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
      setLocation(loc);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) fetchAndUpdateVehicles();
    }, [user?.id])
  );

  // Queries
  const {
    data: tripsShared = [],
    isLoading: loadingTripsShared,
    refetch: refetchTripsShared,
  } = useNavigateQuery("?limit=5&excludeSelf=true&isGroup=false");

  const {
    data: lastTrips = [],
    isLoading: loadingLastTrips,
    refetch: refetchLastTrips,
  } = useNavigateQuery(user?.id ? `?limit=5&owner=${user.id}` : null, {
    enabled: user?.id ? true : false,
  });

  const {
    data: nearbyRides = [],
    isLoading: loadingNearbyRides,
    refetch: refetchNearbyRides,
  } = useNavigateQuery(
    location
      ? `?lat=${location.coords.latitude}&lon=${location.coords.longitude}&radius=10&limit=5&excludeSelf=true&isGroup=true&startTime=${startTime}`
      : `?limit=5&excludeSelf=true&isGroup=true&startTime=${startTime}`,
    {
      enabled: !!location,
    }
  );

  const handleScrollEnd = useCallback(
    (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / CARD_WIDTH);
      const item = vehicles[index];
      if (item && !item.add) changeVehicle(item);
    },
    [vehicles]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setStartTime(new Date().toISOString());
    try {
      await Promise.all([
        refetchTripsShared(),
        refetchLastTrips(),
        refetchNearbyRides(),
        fetchAndUpdateVehicles(), // si tu veux aussi rafraîchir les véhicules
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const renderSection = (title, isLoading, data, emptyMessage) => (
    <>
      <Text className="mt-4 text-xl text-center font-bold">{title}</Text>
      <Separator />
      {isLoading ? (
        <Text className="text-center text-gray-500">Chargement...</Text>
      ) : data.length ? (
        <TripsCarousel trips={data} navigation={navigation} />
      ) : (
        <Text className="text-center text-gray-500">{emptyMessage}</Text>
      )}
    </>
  );

  return (
    <SafeAreaView className={`flex mb-[${tabBarHeight}px]`}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 65 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
              navigation={navigation}
              onFavoriteChange={fetchAndUpdateVehicles}
              showAddCard
            />
            {renderSection(
              "Tes derniers trajets",
              loadingLastTrips,
              lastTrips,
              "Tu n'as pas encore enregistré de trajet 😕"
            )}
          </>
        )}

        {renderSection(
          "Trajets partagés par la communauté",
          loadingTripsShared,
          tripsShared,
          "Aucun trajet partagé pour le moment 😕"
        )}

        {renderSection(
          "Rides proches de toi à venir",
          loadingNearbyRides,
          nearbyRides,
          "Aucun ride à venir proche de toi pour le moment 😕"
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
