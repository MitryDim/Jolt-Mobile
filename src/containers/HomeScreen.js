import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import React, {
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
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import { MaintainContext } from "../context/MaintainContext";
import { useFocusEffect } from "@react-navigation/native";
import VehicleCarousel from "../components/VehicleCarousel";
import { useVehicles } from "../hooks/useVehicles";
const CARD_WIDTH = Dimensions.get("window").width * 0.7;
const CARD_HEIGHT = Dimensions.get("window").height * 0.3;
const SPACING_FOR_CARD_INSET = 5;

const HomeScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  const { changeVehicle, vehicle } = useContext(MaintainContext);
  const fetchWithAuth = useFetchWithAuth();
  const [scooters, setScooters] = useState([]);
  const { expoPushToken, notification, error } = useNotification();
  const {
    vehicles,
    loading,
    error: errorVehicle,
    fetchVehicles,
  } = useVehicles();
  // const fetchScooters = async () => {
  //   try {
  //     const { success, data, error } = await fetchWithAuth(
  //       `${EXPO_GATEWAY_SERVICE_URL}/vehicle`,
  //       {
  //         method: "GET",
  //       },
  //       { protected: true }
  //     );
  //     console.log("", data.data);

  //     if (error) {
  //       setScooters([
  //         {
  //           id: new Date().getTime().toString(),
  //           add: true,
  //           img: "",
  //           title: "",
  //           mileage: "",
  //           maintains: "",
  //           firstPurchaseDate: "",
  //         },
  //       ]);
  //       return;
  //     }
  //     const formatted = data?.data.map((item) => ({
  //       id: item._id,
  //       add: false,
  //       img: item.image,
  //       title: `${item.brand} ${item.model}`,
  //       mileage: item.mileage,
  //       maintains: "", // À adapter selon tes besoins
  //       firstPurchaseDate: item?.firstPurchaseDate,
  //     }));
  //     formatted.push({
  //       id: new Date().getTime().toString(),
  //       add: true,
  //       img: "",
  //       title: "",
  //       mileage: "",
  //       maintains: "",
  //       firstPurchaseDate: "",
  //     });
  //     formatted.sort((a, b) => {
  //       if (a.id === vehicle?.id) return -1; // Met l'élément sélectionné en premier
  //     });
  //     setScooters(formatted);
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des scooters:", error);
  //   }
  // };

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [])
  );

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
      <Text className="mt-4 text-xl text-center font-bold">Ton équipement</Text>
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
        onFavoriteChange={fetchVehicles} 
        showAddCard={true}
      />

      <Text className="mt-4 text-xl text-center font-bold">
        T'es dernier trajets
      </Text>
      <Separator />
      <View style={{ margin: 16 }}>
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
      </View>
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
