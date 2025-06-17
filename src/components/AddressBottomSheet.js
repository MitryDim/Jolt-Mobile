import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { View, Text, TextInput, StyleSheet, Keyboard } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import IconComponent from "./Icons";
import ActivityIndicator from "./ActivityIndicator";
import { calculateMultipleRoutes } from "../helpers/Api";
import * as Location from "expo-location";
const AddressBottomSheet = ({
  bottomSheetRef,
  onSelectAddress,
  onSheetHeightChange,
}) => {
  const snapPoints = useMemo(() => [90, "25%", "95%"], []);
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleSheetChange = useCallback((index) => {
    if (snapPoints[index] !== "95%") Keyboard.dismiss();
  }, []);

  const fetchSuggestions = async (input) => {
    if (!input) return setSuggestions([]);
    setLoading(true);
    try {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        input
      )}&autocomplete=1&limit=5`;
      const res = await fetch(url);
      const json = await res.json();
      setSuggestions(json.features);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.inputContainer}>
      <IconComponent icon="search" library="MaterialIcons" size={20} />
      <TextInput
        style={styles.input}
        placeholder="Entrez une adresse"
        value={addressInput}
        onChangeText={handleInputChange}
        onFocus={() => bottomSheetRef?.current?.expand()}
      />
      {loading ? (
        <ActivityIndicator size={20} />
      ) : (
        addressInput.length > 0 && (
          <IconComponent
            icon="close"
            library="MaterialIcons"
            size={20}
            onPress={() => setAddressInput("")}
          />
        )
      )}
    </View>
  );

  const handleInputChange = (text) => {
    setAddressInput(text);
    if (timeoutId) clearTimeout(timeoutId);
    const newId = setTimeout(() => fetchSuggestions(text), 500);
    setTimeoutId(newId);
  };

  const handleSelect = async (item) => {
    let userLocation = await Location.getLastKnownPositionAsync({
      maxAge: 10000, // 10 seconds
      requiredAccuracy: Location.Accuracy.High,
    });
    if (!userLocation)
      userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
    console.log("User location:", userLocation);
    if (!userLocation) return;
    userLocation = {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      heading: userLocation.coords.heading,
    };
    try {
      const endCoords = [
        item.geometry.coordinates[0],
        item.geometry.coordinates[1],
      ];
      const startCoords = [userLocation.longitude, userLocation.latitude];
      const routeOptions = await calculateMultipleRoutes(
        startCoords,
        endCoords,
        3,
        [[userLocation.heading || 0, 20]]
      );
      onSelectAddress(item, routeOptions);
    } catch (err) {
      console.error("Erreur lors de la récupération des itinéraires:", err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text onPress={() => handleSelect(item)}>{item.properties.label}</Text>
    </View>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      onChange={handleSheetChange}
      onLayout={(e) => onSheetHeightChange?.(e.nativeEvent.layout.height)}
    >
      {renderHeader()}
      <BottomSheetFlatList
        data={suggestions}
        renderItem={renderItem}
        keyExtractor={(item) => item.properties.id}
        ListEmptyComponent={() =>
          !loading && addressInput.length > 1 ? (
            <Text style={styles.emptyText}>Aucun résultat</Text>
          ) : null
        }
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    color: "gray",
  },
});

export default AddressBottomSheet;
