import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
} from "react";
import TraveledCards from "../components/RouteTraveled/TraveledCards";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import * as Location from "expo-location";
import FilterBottomSheet from "../components/FilterBottomSheet";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { UserContext } from "../context/AuthContext";

const ALL_TABS = [
  { key: "myTrips", label: "Mes trajets" },
  { key: "shared", label: "Trajets partagés" },
  { key: "rides", label: "Rides proches" },
];

const RouteTraveledScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
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

  const [filters, setFilters] = useState({
    myTrips: { selectedFilter: null, radius: 10 },
    shared: { selectedFilter: null, radius: 10 },
    rides: { selectedFilter: null, radius: 10 },
  });

  const bottomSheetRef = useRef(null);
  const [appliedFilter, setAppliedFilter] = useState({
    selectedFilter: null,
    radius: 10,
  });

  const TABS = user
    ? ALL_TABS
    : ALL_TABS.filter((tab) => tab.key !== "myTrips");

  const [activeTab, setActiveTab] = useState(TABS[0]?.key || "shared");

  const [myTrips, setMyTrips] = useState([]);
  const [rides, setRides] = useState([]);
  const tabBarTranslateY = useSharedValue(0);

  useEffect(() => {
    if (activeTab === "myTrips") fetchMyTrips();
    if (activeTab === "shared") fetchTripsShared();
    if (activeTab === "rides") fetchRides();
  }, [activeTab]);

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
      //fetch la premiere tab
      if (TABS.length > 0 && TABS[0].key === "myTrips") {
        fetchMyTrips(1);
      } else if (TABS.length > 0 && TABS[0].key === "shared") {
        fetchTripsShared(1);
      }

      if (!currentCity.city) {
        getCurrentPosition();
      }
    }, [])
  );

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    tabBarTranslateY.value = y;
  };

  const tabBarStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          tabBarTranslateY.value > 30 ? withTiming(-60) : withTiming(0),
      },
    ],
    zIndex: 10,
  }));

  const TabsBar = () => (
    <Animated.View
      style={[
        {
          backgroundColor: "white",
          flexDirection: "row",
          borderBottomWidth: 1,
          borderColor: "#eee",
        },
        tabBarStyle,
      ]}
    >
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderBottomWidth: activeTab === tab.key ? 2 : 0,
            borderBottomColor: "#007bff",
          }}
          onPress={() => setActiveTab(tab.key)}
        >
          <Text
            style={{
              textAlign: "center",
              color: activeTab === tab.key ? "#007bff" : "#333",
              fontWeight: activeTab === tab.key ? "bold" : "normal",
            }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  let dataToShow = [];
  if (activeTab === "myTrips") dataToShow = myTrips;
  if (activeTab === "shared") dataToShow = tripsShared;
  if (activeTab === "rides") dataToShow = rides;

  const handleApplyFilter = (filterState) => {
    setFilters((prev) => ({
      ...prev,
      [activeTab]: filterState,
    }));
    // Appelle le fetch de la tab active avec le nouveau filtre
    if (activeTab === "shared") fetchTripsShared(1, filterState);
    if (activeTab === "rides") fetchRides(1, filterState);
    if (activeTab === "myTrips") fetchMyTrips(1, filterState);
  };

  const fetchTripsShared = async (pageNumber = 1, filter = filters.shared) => {
    try {
      setIsLoadingMore(true);

      // Construction de la query string selon le filtre
      let query = `limit=${limit}&excludeSelf=true&page=${pageNumber}&isGroup=false`;
      if (filter.selectedFilter) {
        const { latitude, longitude } = filter.selectedFilter;
        const radius = filter.radius;
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
  const fetchMyTrips = async (pageNumber = 1, filter = filters.myTrips) => {
    try {
      setIsLoadingMore(true);
      // Pas de excludeSelf ici !
      let query = `limit=${limit}&page=${pageNumber}`;
      console.log("Current city for my trips:", filter);
      if (filter.selectedFilter) {
        const { latitude, longitude } = filter.selectedFilter;
        const radius = filter.radius;
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

  const fetchRides = async (pageNumber = 1, filter = filters.rides) => {
    try {
      setIsLoadingMore(true);

      // Construction de la query string selon le filtre
      let query = `limit=${limit}&excludeSelf=true&page=${pageNumber}&isGroup=true&startTime=${new Date().toISOString()}`;
      if (
        currentCity.latitude &&
        currentCity.longitude &&
        !filter.selectedFilter
      ) {
        query += `&lat=${currentCity.latitude}&lon=${
          currentCity.longitude
        }&radius=${10}`;
      }

      console.log("Current city for rides:", filter.selectedFilter);

      if (filter.selectedFilter) {
        const { latitude, longitude } = filter.selectedFilter;
        const radius = filter.radius;
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
          setRides(newNavigations);
        } else {
          setRides((prev) => [...prev, ...newNavigations]);
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

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      if (activeTab === "myTrips") fetchMyTrips(nextPage, filters.myTrips);
      if (activeTab === "rides") fetchRides(nextPage, filters.rides);
      if (activeTab === "shared") fetchTripsShared(nextPage, filters.shared);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={{ flex: 1, backgroundColor: "white", marginBottom: 60 }}
      >
        <View className="flex  items-center justify-center flex-row p-4  border-b border-gray-200 shadow-sm">
          <Text className="font-bold text-2xl">RoadBooks</Text>
        </View>
        <FlatList
          data={dataToShow}
          keyExtractor={(item, index) =>
            item._id?.toString() || index.toString()
          }
          renderItem={({ item, index }) => (
            <TraveledCards width={"100%"} data={item} index={index} />
          )}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ padding: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListHeaderComponent={
            <View>
              <TabsBar />
              <TouchableOpacity
                className="p-4 bg-blue-500 rounded-lg m-4"
                onPress={() => {
                  bottomSheetRef.current?.expand();
                }}
              >
                <Text>Filtrer</Text>
              </TouchableOpacity>

              {/* <View className="p-6 flex items-center">
                <Text className="text-2xl font-bold">
                  {TABS.find((t) => t.key === activeTab)?.label}
                </Text>
              </View> */}
            </View>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View className="my-4 items-center ">
                <ActivityIndicator size="large" color="#007bff" />
              </View>
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      </SafeAreaView>

      <FilterBottomSheet
        bottomSheetRef={bottomSheetRef}
        onApply={handleApplyFilter}
        initialRadius={filters[activeTab].radius}
        initialSelectedFilter={filters[activeTab].selectedFilter}
        currentCity={currentCity}
        handleCloseBottomSheet={handleCloseBottomSheet}
        defaultLocation={activeTab === "rides"}
      />
    </View>
  );
};

export default RouteTraveledScreen;
