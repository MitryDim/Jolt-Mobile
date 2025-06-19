import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetTextInput,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import IconComponent from "./Icons";
import { calculateMultipleRoutes } from "../helpers/Api";
import * as Location from "expo-location";
import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigationMode } from "../context/NavigationModeContext";
import LoadingOverlay from "./LoadingOverlay";

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
  const MAX_VISIBLE = 3;

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
    // Vérifie si déjà présent (par exemple par id ou label)
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
  const renderCombinedItem = ({ item }) => {
    return renderItem({ item, type: item.type });
  };
  // const handleSheetChange = useCallback((index) => {
  //   if (snapPoints[index] !== "95%") Keyboard.dismiss();
  // }, []);

  const fetchSuggestions = async (input) => {
    if (!input) return setSuggestions([]);
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };
  const goToAddFavorite = () => {
    navigation.navigate("AddFavorite");
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      key={item?._id || item.id}
      onPress={() => handleSelect(item, false)}
    >
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

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
      <View style={styles.inputContainer}>
        <IconComponent
          icon="search"
          library="Feather"
          size={20}
          style={styles.icon}
        />
        <BottomSheetTextInput
          placeholder="Où allons-nous ?"
          style={styles.input}
          placeholderTextColor="#888"
          onChange={(e) => handleInputChange(e.nativeEvent.text)}
        />
      </View>

      <FlatList
        data={filteredFavorites}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.favoritesList}
        showsHorizontalScrollIndicator={false}
        ListFooterComponent={() => (
          <>
            {!suggestions.length > 0 &&
              (favoritesAddresses.length <= MAX_VISIBLE ? (
                <Text
                  style={[styles.addFavoriteButton, { marginLeft: 8 }]}
                  onPress={goToAddFavorite}
                >
                  + Nouveau
                </Text>
              ) : (
                <Text
                  style={[styles.addFavoriteButton, { marginLeft: 8 }]}
                  onPress={() => {
                    /* ouvrir la liste complète ou modal */
                  }}
                >
                  Afficher plus
                </Text>
              ))}
          </>
        )}
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
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        onLayout={(e) => onSheetHeightChange?.(e.nativeEvent.layout.height)}
        handleComponent={handleComponent}
        keyboardBehavior="fillParent"
        keyboardBlurBehavior="restore"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {renderHeader()}

          <BottomSheetFlatList
            data={combinedData}
            renderItem={renderCombinedItem}
            keyExtractor={(item, index) => `${item.properties?.id}-${index}`}
            ListEmptyComponent={() =>
              !isLoading && addressInput.length > 1 ? (
                <Text style={styles.emptyText}>Aucun résultat</Text>
              ) : null
            }
            style={{ marginBottom: 0, paddingBottom: 0 }}
            contentContainerStyle={{ paddingBottom: 0, marginBottom: 0 }}
          />
        </KeyboardAvoidingView>
      </BottomSheet>
      {isLoading && <LoadingOverlay></LoadingOverlay>}
    </>
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
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    color: "gray",
  },
  footerContainer: {
    padding: 16,
  },
  addFavoriteButton: {
    color: "#007AFF",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 12,
  },
  favoritesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  favoritesTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  favoritesList: {
    paddingVertical: 8,
    padding: 16,
  },
  favoriteItem: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
});

export default AddressBottomSheet;
