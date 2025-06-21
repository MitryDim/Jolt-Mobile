import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import IconComponent from "./Icons";
import { calculateMultipleRoutes } from "../helpers/Api";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigationMode } from "../context/NavigationModeContext";
import LoadingOverlay from "./LoadingOverlay";
import FavoriteList from "./FavoriteList";
import AddressSearchBar from "./AddressSearchBar";
import SuggestionHistoryList from "./SuggestionHistoryList";

const AddressBottomSheet = ({
  bottomSheetRef,
  onSelectAddress,
  onSheetHeightChange,
  handleComponent,
  navigation,
}) => {
  const [history, setHistory] = useState([]);
  const { favoritesAddresses, fetchFavorites } = useNavigationMode();
  const snapPoints = useMemo(() => [90, "25%", "95%"], []);
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("searchHistory").then((data) => {
      if (data) setHistory(JSON.parse(data));
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const addToHistory = async (item) => {
    const exists = history.some((h) => h.properties.id === item.properties.id);
    if (!exists) {
      const newHistory = [item, ...history].slice(0, 10); // max 10 éléments
      setHistory(newHistory);
      await AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
  };
  const filtredHistory = useMemo(() => {
    if (addressInput.length === 0) return history;
    return history.filter((h) =>
      h.properties?.label?.toLowerCase()?.includes(addressInput?.toLowerCase())
    );
  }, [addressInput, history]);

  const filteredFavorites = useMemo(() => {
    if (suggestions && suggestions.length === 0) return favoritesAddresses;

    return favoritesAddresses.filter((fav) =>
      suggestions.some(
        (s) =>
          s.geometry.coordinates[0] === fav.lon &&
          s.geometry.coordinates[1] === fav.lat
      )
    );
  }, [suggestions, favoritesAddresses]);

  const combinedData = useMemo(() => {
    const combined = [];

    if (filtredHistory.length > 0) {
      combined.push(
        ...filtredHistory.map((item) => ({ ...item, type: "history" }))
      );
    }

    if (suggestions.length > 0) {
      combined.push(
        ...suggestions.map((item) => ({ ...item, type: "suggestion" }))
      );
    }

    return combined;
  }, [filtredHistory, suggestions]);

  const fetchSuggestions = async (input) => {
    if (!input) return setSuggestions([]);
    setIsLoadingSuggestions(true);
    try {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        input
      )}&autocomplete=1&limit=5`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json.features || json.features.length === 0) {
        setSuggestions([]);
        return;
      }
      setSuggestions(json.features);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const goToAddFavorite = () => {
    navigation.navigate("AddFavoriteAddress");
  };

  const handleInputChange = (text) => {
    setAddressInput(text);
    if (timeoutId) clearTimeout(timeoutId);
    const newId = setTimeout(() => fetchSuggestions(text), 500);
    setTimeoutId(newId);
  };

  const fetchMultipleRoutes = async (
    startCoords,
    endCoords,
    maxRoutes,
    heading
  ) => {
    try {
      const routeOptions = await calculateMultipleRoutes(
        startCoords,
        endCoords,
        maxRoutes,
        [[heading || 0, 20]]
      );
      return routeOptions;
    } catch (err) {
      console.error("Erreur lors de la récupération des itinéraires:", err);
    }
  };

  const handleSelect = async (item, toHistory = true) => {
    setIsLoading(true);
    let userLocation = await Location.getLastKnownPositionAsync({
      maxAge: 10000,
      requiredAccuracy: Location.Accuracy.High,
    });
    if (!userLocation)
      userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

    if (!userLocation) return;
    userLocation = {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      heading: userLocation.coords.heading,
    };
    try {
      // Vérifie si l'item a des coordonnées valides

      const endCoords = [
        item?.geometry?.coordinates?.[0] || item.lat,
        item?.geometry?.coordinates?.[1] || item.lon,
      ];
      const startCoords = [userLocation.longitude, userLocation.latitude];

      const routeOptions = await fetchMultipleRoutes(
        startCoords,
        endCoords,
        3,
        userLocation.heading
      );
      if (toHistory) await addToHistory(item);
      setIsLoading(false);
      onSelectAddress(item?.properties?.label || item?.label, routeOptions);
    } catch (err) {
      console.error("Erreur lors de la récupération des itinéraires:", err);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <AddressSearchBar
        value={addressInput}
        onChange={handleInputChange}
        TextInputComponent={BottomSheetTextInput}
        loading={isLoadingSuggestions}
      />

      <FavoriteList
        favorites={filteredFavorites}
        onSelect={(item) => handleSelect(item, false)}
        onAddNew={goToAddFavorite}
      />
    </View>
  );
  const renderItem = ({ item, type }) => (
    <View style={styles.item}>
      {type === "history" ? (
        <IconComponent
          library={"FontAwesome6"}
          icon={"clock-rotate-left"}
          color={"black"}
          size={18}
          style={{ marginLeft: 8, marginRight: 8 }}
        />
      ) : (
        <IconComponent
          library={"Feather"}
          icon={"map-pin"}
          color={"black"}
          size={18}
          style={{ marginLeft: 8, marginRight: 8 }}
        />
      )}
      <Text onPress={() => handleSelect(item)} style={{ flex: 1 }}>
        {item.properties.label}
      </Text>
    </View>
  );

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        onLayout={(e) => onSheetHeightChange?.(e.nativeEvent.layout.height)}
        handleComponent={handleComponent}
        keyboardBehavior="fillParent"
        keyboardBlurBehavior="restore"
        style={{ marginBottom: 0, paddingBottom: 0 }}
        contentContainerStyle={{ paddingBottom: 0, marginBottom: 0 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {renderHeader()}
          <SuggestionHistoryList
            data={combinedData}
            onSelect={handleSelect}
            isLoading={isLoading}
            addressInput={addressInput}
            FlatListComponent={BottomSheetFlatList}
          />
        </KeyboardAvoidingView>
      </BottomSheet>
      {isLoading && <LoadingOverlay></LoadingOverlay>}
    </>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default AddressBottomSheet;
