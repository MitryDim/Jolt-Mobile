import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useCallback, useEffect, useRef } from "react";
import TraveledCards from "../components/RouteTraveled/TraveledCards";
import { SafeAreaView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Separator from "../components/Separator";
import { useFocusEffect } from "@react-navigation/native";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import * as Location from "expo-location";
import SuggestionHistoryList from "../components/SuggestionHistoryList";
import FilterBottomSheet from "../components/FilterBottomSheet";
const RouteTraveledScreen = ({ navigation }) => {
  const fetchWithAuth = useFetchWithAuth();
  const [tripsShared, setTripsShared] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;
  const [currentCity, setCurrentCity] = useState({
    city: "",
    latitude: null,
    longitude: null,
  });
  const [selectedFilter, setSelectedFilter] = useState(null);
  // const [suggestions, setSuggestions] = useState([]);
  // const [timeoutId, setTimeoutId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  // const [searchisLoading, setSearchIsLoading] = useState(false);
  const [radius, setRadius] = useState(10);
  const bottomSheetRef = useRef(null);
  const [appliedFilter, setAppliedFilter] = useState({
    selectedFilter: null,
    radius: 10,
  });

  const handleApplyFilter = (filterState) => {
    setAppliedFilter(filterState);
    setRadius(filterState.radius);
    setSelectedFilter(filterState.selectedFilter);
    fetchTripsShared(1); // ou adapte la requête selon le filtre
  };

  // const handleResetFilter = () => {
  //   setAppliedFilter({
  //     selectedFilter: null,
  //     radius: 10,
  //   });
  //   setRadius(10);
  //   setSelectedFilter(null);
  //   fetchTripsShared(1);
  // };

  const handleGetCurrentPosition = () => {
    getCurrentPosition(); // ta fonction existante
    fetchTripsShared(1);
  };

  const handleValidateFilter = (newRadius) => {
    setRadius(newRadius);
    fetchTripsShared(1);
  };

  const fetchTripsShared = async (pageNumber = 1) => {
    try {
      setIsLoadingMore(true);

      // Construction de la query string selon le filtre
      let query = `limit=${limit}&excludeSelf=true&page=${pageNumber}`;
      if (appliedFilter.selectedFilter) {
        const { latitude, longitude } = appliedFilter.selectedFilter;
        const radius = appliedFilter.radius;
        if (latitude && longitude && radius) {
          query += `&lat=${latitude}&lon=${longitude}&radius=${radius}`;
        }
      }

      const { data, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate?${query}`,
        { method: "GET" }
      );

      if (status === 200 && data?.data?.navigations) {
        const newNavigations = data.data.navigations;
        console.log("Trajets partagés récupérés:", newNavigations);
        if (pageNumber === 1) {
          setTripsShared(newNavigations);
        } else {
          setTripsShared((prev) => [...prev, ...newNavigations]);
        }
        setHasMore(newNavigations.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des trajets partagés:",
        error
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") return;
  //     let location = await Location.getCurrentPositionAsync({});
  //     let [place] = await Location.reverseGeocodeAsync(location.coords);
  //     console.log("Current location:", place);
  //     if (place && place.city)
  //       setCurrentCity({
  //         city: place.city,
  //         latitude: location.coords.latitude,
  //         longitude: location.coords.longitude,
  //       });
  //   })();
  // }, []);

  const getCurrentPosition = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    let [place] = await Location.reverseGeocodeAsync(location.coords);
    console.log("Current location:", place);
    if (place && place.city) {
      setCurrentCity({
        city: place.city,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } else {
      console.warn("No city found for current location");
      setCurrentCity({
        city: "",
        latitude: null,
        longitude: null,
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchTripsShared(1);

      if (!currentCity.city) {
        getCurrentPosition();
      }
    }, [])
  );

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTripsShared(nextPage);
    }
  };

  const goToMyTrips = () => {
    navigation.navigate("MyTrips"); // remplace par le nom exact de ton écran de trajets persos
  };

  // const handleSearchChange = (text) => {
  //   setSearchInput(text);
  //   if (text.trim() === "") {
  //     setSearchIsLoading(false);
  //     if (timeoutId) clearTimeout(timeoutId);
  //     return;
  //   }
  //   if (timeoutId) clearTimeout(timeoutId);
  //   const newId = setTimeout(() => {
  //     setSearchIsLoading(true);
  //   }, 500);
  //   setTimeoutId(newId);
  // };

  return (
    <>
      {/* Header avec le titre et le bouton pour aller aux trajets persos */}
      <SafeAreaView className="flex-1 bg-white mb-[60px]">
        <View className="flex items-center justify-center flex-row p-4  border-b border-gray-200 shadow-sm">
          <Text className="font-bold text-2xl">RoadBooks</Text>
        </View>

        <TouchableOpacity
          className="p-4 bg-blue-500 rounded-lg m-4"
          onPress={() => {
            bottomSheetRef.current?.expand();
          }}
        >
          <Text>Filtrer</Text>
        </TouchableOpacity>

        {/* Le reste du contenu */}
        <View style={{ flex: 1 }}>
          <View className="p-6 flex items-center">
            <Text className="text-2xl font-bold">Trajets partagés </Text>
          </View>
          <Separator />
          <FlatList
            contentContainerStyle={{ padding: 12 }}
            keyExtractor={(item, index) =>
              item._id?.toString() || index.toString()
            }
            data={tripsShared}
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
        </View>
      </SafeAreaView>

      <FilterBottomSheet
        bottomSheetRef={bottomSheetRef}
        onApply={handleApplyFilter}
        initialRadius={appliedFilter.radius}
        initialSelectedFilter={appliedFilter.selectedFilter}
        currentCity={currentCity}
        handleCloseBottomSheet={handleCloseBottomSheet}
      />
    </>
  );
};

export default RouteTraveledScreen;
