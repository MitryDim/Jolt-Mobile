import { View, Text, StyleSheet, Dimensions } from "react-native";
import React, { useCallback, useContext, useState } from "react";
import Maintains from "../components/Maintains";
import { MaintainContext } from "../context/MaintainContext";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import VehicleCarousel from "../components/VehicleCarousel";
import { useVehicles } from "../hooks/useVehicles";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD_WIDTH = Dimensions.get("window").width * 0.7;
const MaintainsScreen = ({ navigation }) => {
  const { vehicle } = useContext(MaintainContext);
  const [vehicleSelected, setVehicleSelected] = useState(vehicle);
  const { vehicles, loading, error, fetchVehicles } = useVehicles();

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
      setVehicleSelected(item);
    }
  };

  return (
    <SafeAreaView className="flex mb-[60px]">
      <ScrollView  >
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
        />
        <Maintains vehicle={vehicleSelected} />
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
export default MaintainsScreen;
