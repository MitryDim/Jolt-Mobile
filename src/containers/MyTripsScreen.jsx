import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import TraveledCards from "../components/RouteTraveled/TraveledCards";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import Separator from "../components/Separator";

const MyTripsScreen = ({ navigation }) => {
  const fetchWithAuth = useFetchWithAuth();
  const [myTrips, setMyTrips] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;

  const fetchMyTrips = async (pageNumber = 1) => {
    try {
      setIsLoadingMore(true);
      // Pas de excludeSelf ici !
      const query = `limit=${limit}&page=${pageNumber}`;
      const { data, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate?${query}`,
        { method: "GET" }
      );
      if (status === 200 && data?.data?.navigations) {
        const newNavigations = data.data.navigations;
        if (pageNumber === 1) {
          setMyTrips(newNavigations);
        } else {
          setMyTrips((prev) => [...prev, ...newNavigations]);
        }
        setHasMore(newNavigations.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de mes trajets:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchMyTrips(1);
    }, [])
  );

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMyTrips(nextPage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white mb-[60px]">
      <View className="flex items-center justify-center flex-row p-4 border-b border-gray-200 shadow-sm">
        <Text className="font-bold text-2xl">Mes trajets</Text>
      </View>
      <View className="p-6 flex items-center">
        <Text className="text-2xl font-bold">Tous mes trajets</Text>
      </View>
      <Separator />
      <FlatList
        contentContainerStyle={{ padding: 12 }}
        keyExtractor={(item, index) => item._id?.toString() || index.toString()}
        data={myTrips}
        renderItem={({ item, index }) => (
          <TraveledCards width={"100%"} data={item} index={index} />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="my-4 items-center ">
              <ActivityIndicator size="large" color="#007bff" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default MyTripsScreen;
