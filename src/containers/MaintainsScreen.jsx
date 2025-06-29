import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Maintains from "../components/Maintains";

import { useFocusEffect } from "@react-navigation/native";
import VehicleCarousel from "../components/VehicleCarousel";
import { useVehicleData } from "../context/VehicleDataContext";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD_WIDTH = Dimensions.get("window").width * 0.7;
const MaintainsScreen = ({ navigation }) => {
  const [vehicleSelected, setVehicleSelected] = useState();
  const { vehicles, updateVehicles, fetchAndUpdateVehicles } = useVehicleData();
  useFocusEffect(
    useCallback(() => {
      fetchAndUpdateVehicles();
    }, [])
  );
  useEffect(() => {
    if (vehicles.length === 0) return;
    // Si le véhicule sélectionné n'existe plus, on prend le premier
    const findVehicle = vehicles.find((v) => v.id === vehicleSelected?.id);
    if (!vehicleSelected || !findVehicle) {
      setVehicleSelected(vehicles[0]);
    }
  }, [vehicles]);

  useEffect(() => {
    if (vehicles.length > 0 && vehicleSelected) {
      console.log("Vehicle selected:", vehicleSelected);
      // setPendingCount(vehicleSelected?.maintains || 0);
    }
  }, [vehicleSelected]);

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);
    const item = vehicles[index];
    console.log("handleScrollEnd", index, item);
    if (item && !item.add) {
      setVehicleSelected(item);
      console.log("Vehicle selected:", item);
      //  setPendingCount(item.maintains || 0);
    }
  };

  return (
    <SafeAreaView className="flex mb-[60px]">
      <ScrollView>
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
        />
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-end",
            marginRight: 20,
            marginTop: 10,
            marginBottom: 5,
          }}
          onPress={() =>
            navigation.navigate("MaintainHistory", { vehicle: vehicleSelected })
          }
        >
          <Text style={{ color: "#007bff", fontWeight: "bold", fontSize: 16 }}>
            Voir l'historique
          </Text>
          <Text style={{ fontSize: 20, color: "#007bff", marginLeft: 4 }}>
            {">"}
          </Text>
        </TouchableOpacity>
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
