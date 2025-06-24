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
const CARD_HEIGHT = Dimensions.get("window").height * 0.3;
const SPACING_FOR_CARD_INSET = 5;
import items from "../Data/traveled"; // Importez vos données de véhicules ici
import TripsCarousel from "../components/TripsCarousel";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
const HomeScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  const fetchWithAuth = useFetchWithAuth();
  const {
    expoPushToken,
    notification,
    error: notificationError,
  } = useNotification();
  const { vehicles, vehicleSelected, changeVehicle, fetchAndUpdateVehicles } =
    useVehicleData();
  const { user } = useContext(UserContext);
  const [lastTrips, setLastTrips] = useState([]);

  useFocusEffect(
    useCallback(() => {
      console.log("HomeScreen focus effect");
      fetchAndUpdateVehicles();
      fetchLastTrips();
    }, [user])
  );

  const fetchLastTrips = async () => {
    try {
      const { data, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate?limit=5`,
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
      console.error(
        "Erreur lors de la récupération des derniers trajets:",
        error
      );
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
  return (
    <SafeAreaView className="flex mb-[60px]">
      <ScrollView>
        {user && (
          <>
            <Text className="mt-4 text-xl text-center font-bold">
              Ton équipement
            </Text>
            <Separator />
            <VehicleCarousel
              items={vehicles}
              onCardPress={(item) => {
                // logique pour afficher le détail du scooter
              }}
              onAddPress={() => navigation.navigate("AddVehicle")}
              onMomentumScrollEnd={handleScrollEnd}
              styles={styles}
              navigation={navigation}
              onFavoriteChange={fetchAndUpdateVehicles}
              showAddCard={true}
            />

            <Text className="mt-4 text-xl text-center font-bold">
              T'es dernier trajets
            </Text>
            <Separator />
            <TripsCarousel trips={lastTrips} navigation={navigation} />
          </>
        )}
        <View className="px-4 py-8">
          <Text className="mt-4 text-xl text-center font-bold">
            Trajets partagés par la communauté
          </Text>
          <Separator />
          <TripsCarousel trips={items} navigation={navigation} />
        </View>
        {/* <View style={{ margin: 16 }}>
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
      </View> */}
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
