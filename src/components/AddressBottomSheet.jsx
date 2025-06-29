import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { calculateMultipleRoutes } from "../helpers/Api";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigationMode } from "../context/NavigationModeContext";
import LoadingOverlay from "./LoadingOverlay";
import FavoriteList from "./FavoriteList";
import AddressSearchBar from "./SearchBar";
import SuggestionHistoryList from "./SuggestionHistoryList";
import { getDistance } from "../utils/Utils";
import { SafeAreaView } from "react-native-safe-area-context";
const AddressBottomSheet = ({
  bottomSheetRef,
  onSelectAddress,
  onSheetHeightChange,
  handleComponent,
  navigation,
}) => {
  const [sheetIndex, setSheetIndex] = useState(1);
  const [history, setHistory] = useState([]);
  const { favoritesAddresses, fetchFavorites } = useNavigationMode();
  const snapPoints = useMemo(() => [90, "25%", "95%"]);
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const frequentDestination = useMemo(
    () => getFrequentDestination(history),
    [history]
  );
  const [showSuggestionModal, setShowSuggestionModal] = useState(
    !!frequentDestination
  );
  useEffect(() => {
    const loadHistory = async () => {
      const data = await AsyncStorage.getItem("searchHistory");
      if (data) {
        const parsedHistory = JSON.parse(data);
        let userLocation = await Location.getLastKnownPositionAsync({
          maxAge: 10000,
          requiredAccuracy: Location.Accuracy.High,
        });
        if (!userLocation)
          userLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });

        if (!userLocation) {
          console.warn(
            "No user location available, cannot calculate distances."
          );
          setHistory(parsedHistory);
          return;
        }

        const { latitude, longitude } = userLocation.coords;

        const historyWithDistance = parsedHistory.map((item) => {
          const [lon, lat] = item.geometry?.coordinates || [item.lon, item.lat];
          const distance = getDistance(latitude, longitude, lat, lon) / 1000; // Convertit en km
          return { ...item, distance };
        });
        setHistory(historyWithDistance);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    setShowSuggestionModal(!!frequentDestination);
  }, [frequentDestination]);

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
    }, [])
  );

  function getFrequentDestination(history) {
    if (!history?.length) return null;
    const now = new Date();
    const freq = {};

    history.forEach((item) => {
      const label = item.properties?.label || item.label;
      if (!freq[label])
        freq[label] = { count: 0, item, recent: 0, hours: [], weekdays: [] };

      const date = new Date(item.time);
      const diffDays = (now - date) / (1000 * 60 * 60 * 24);
      let recentScore = 0;
      if (diffDays <= 7) recentScore = 3;
      else if (diffDays <= 30) recentScore = 2;
      else recentScore = 1;

      freq[label].count += 1;
      freq[label].recent += recentScore;
      freq[label].hours.push(date.getHours());
      freq[label].weekdays.push(date.getDay());
    });

    const nowHour = now.getHours();
    const nowWeekday = now.getDay();

    let best = null;
    let maxScore = 0;
    Object.values(freq).forEach((f) => {
      const hourMatch = f.hours.filter(
        (h) => Math.abs(h - nowHour) <= 1
      ).length;
      const weekdayMatch = f.weekdays.filter((w) => w === nowWeekday).length;
      const score = f.count + f.recent + hourMatch * 2 + weekdayMatch * 2;

      if (score > maxScore) {
        maxScore = score;
        best = f.item;
      }
    });

    return best;
  }

  const renderSuggestionModal = () => {
    return (
      showSuggestionModal &&
      frequentDestination && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}
            >
              Suggestion
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              Aller vers{" "}
              <Text style={{ color: "#007aff" }}>
                {getFavoriteLabel(frequentDestination) ||
                  frequentDestination.properties?.label ||
                  frequentDestination.label}
              </Text>
              ?
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowSuggestionModal(false);
                  handleSelect(frequentDestination);
                }}
              >
                <Text style={{ color: "white" }}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setShowSuggestionModal(false)}
              >
                <Text style={{ color: "#333" }}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )
    );
  };

  const addToHistory = async (item) => {
    const now = Date.now();
    const weekday = new Date(now).getDay(); // 0 = dimanche, 1 = lundi, etc.
    const exists = history.some((h) => h.properties.id === item.properties.id);
    if (!exists) {
      const newItem = {
        ...item,
        time: now,
        weekday,
      };
      const newHistory = [newItem, ...history].slice(0, 10); // max 10 éléments
      setHistory(newHistory);
      await AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
  };

  const groupedHistory = useMemo(() => {
    const map = {};
    history.forEach((item) => {
      const key = item.properties?.id || item.label;
      // Si déjà présent, ne garde que le plus récent
      if (!map[key] || (item.time && item.time > map[key].time)) {
        map[key] = item;
      }
    });
    // Retourne un tableau des items les plus récents par adresse
    return Object.values(map).sort((a, b) => (b.time || 0) - (a.time || 0));
  }, [history]);

  const filtredHistory = useMemo(() => {
    if (addressInput.length === 0) return groupedHistory;
    return groupedHistory.filter((h) =>
      h.properties?.label?.toLowerCase()?.includes(addressInput?.toLowerCase())
    );
  }, [addressInput, groupedHistory]);

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
    if (!input || input === lastQuery) return;
    setLastQuery(input);
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

      // Récupère la position utilisateur
      let userLocation = await Location.getLastKnownPositionAsync({
        maxAge: 10000,
        requiredAccuracy: Location.Accuracy.High,
      });
      if (!userLocation)
        userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
      if (!userLocation) {
        // Si on n'a pas la position, garde les suggestions sans tri
        setSuggestions(json.features);
        return;
      }

      const { latitude, longitude } = userLocation.coords;

      // Ajoute la distance à chaque suggestion
      const suggestionsWithDistance = json.features.map((feature) => {
        const [lon, lat] = feature.geometry.coordinates;
        const distance = getDistance(latitude, longitude, lat, lon) / 1000; // Convertit en km
        return { ...feature, distance };
      });

      // Trie par distance croissante
      suggestionsWithDistance.sort((a, b) => a.distance - b.distance);

      // Met à jour l'état avec les suggestions triées
      setSuggestions(suggestionsWithDistance);
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
  const handleShowMoreFavorites = () => {
    navigation.navigate("FavoriteList");
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
        item?.geometry?.coordinates?.[0] || item.lon,
        item?.geometry?.coordinates?.[1] || item.lat,
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
  const getFavoriteLabel = (destination) => {
    if (!destination) return null;
    // On cherche un favori qui a le même id ou les mêmes coordonnées
    const fav = favoritesAddresses.find(
      (f) =>
        (f.id &&
          destination.properties?.id &&
          f.id === destination.properties.id) ||
        (f.lon ===
          (destination.lon ?? destination.geometry?.coordinates?.[0]) &&
          f.lat === (destination.lat ?? destination.geometry?.coordinates?.[1]))
    );
    return fav ? fav.label : null;
  };

  const renderHeader = () => (
    <View style={{ padding: 3, flexDirection: "row", alignItems: "center" }}>
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
        showMore={handleShowMoreFavorites}
        maxVisible={3}
      />
    </View>
  );

  return (
    <>
      {renderSuggestionModal()}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        onLayout={(e) => onSheetHeightChange?.(e.nativeEvent.layout.height)}
        handleComponent={handleComponent}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        style={{ marginBottom: 0, paddingBottom: 0 }}
        contentContainerStyle={{ paddingBottom: 0, marginBottom: 0 }}
        onChange={setSheetIndex}
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: "80%",
    elevation: 5,
  },
  modalButton: {
    backgroundColor: "#007aff",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8,
  },
});

export default AddressBottomSheet;
