import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { View, Text, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Slider from "@react-native-community/slider";
import AddressSearchBar from "./SearchBar";
import SuggestionHistoryList from "./SuggestionHistoryList";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#007bff",
  lightGray: "#f1f5f9",
  gray: "#888",
  white: "#fff",
};

export default function FilterBottomSheet({
  onApply,
  initialRadius = 10,
  initialSelectedFilter = null,
  bottomSheetRef,
  handleCloseBottomSheet = () => {},
  defaultLocation = false,
}) {
  const snapPoints = useMemo(() => ["100%"], []);
  const [radius, setRadius] = useState(initialRadius);
  const [selectedFilter, setSelectedFilter] = useState(initialSelectedFilter);
  const [suggestions, setSuggestions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const timeoutRef = useRef(null);

  // Centralisation de la géolocalisation
  const fetchCurrentLocation = useCallback(async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    let location = await Location.getLastKnownPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 10000,
      distanceInterval: 10,
    });
    if (!location) {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    }
    let [place] = await Location.reverseGeocodeAsync(location.coords);
    return { location, place };
  }, []);

  useEffect(() => {
    setRadius(initialRadius);
    setSelectedFilter(initialSelectedFilter);
    setSearchInput("");
    setSuggestions([]);

    if (defaultLocation && !initialSelectedFilter) {
      (async () => {
        const result = await fetchCurrentLocation();
        if (result) {
          const { location, place } = result;
          setSelectedFilter({
            type: "geo",
            city: "Autour de moi",
            postalCode: place?.postalCode || "",
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            radius: initialRadius,
          });
        }
      })();
    }
  }, [
    initialRadius,
    initialSelectedFilter,
    defaultLocation,
    fetchCurrentLocation,
  ]);

  const handleSearchChange = (text) => {
    setSearchInput(text);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (text.trim() === "") {
      setSuggestions([]);
      setSearchIsLoading(false);
      if (defaultLocation) {
        (async () => {
          const result = await fetchCurrentLocation();
          if (result) {
            const { location, place } = result;
            setSelectedFilter({
              type: "geo",
              city: "Autour de moi",
              postalCode: place?.postalCode || "",
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              radius,
            });
          } else setSelectedFilter(null);
        })();
      } else if (selectedFilter?.type === "city") {
        setSelectedFilter(null);
      }
      return;
    }

    if (selectedFilter?.type === "geo") setSelectedFilter(null);

    timeoutRef.current = setTimeout(() => {
      setSearchIsLoading(true);
      fetchSuggestions(text);
    }, 500);
  };

  const fetchSuggestions = async (input) => {
    if (!input) return setSuggestions([]);

    try {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        input
      )}&type=municipality&autocomplete=1&limit=5`;
      const res = await fetch(url);
      const json = await res.json();
      setSuggestions(json.features || []);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchIsLoading(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    setSelectedFilter({
      type: "city",
      city: item.properties.city,
      postalCode: item.properties.postcode,
      latitude: item.geometry.coordinates[1],
      longitude: item.geometry.coordinates[0],
      radius,
    });
    setSearchInput(item.properties.city);
    setSuggestions([]);
  };

  const handleAroundMe = async () => {
    const result = await fetchCurrentLocation();
    if (result) {
      const { location, place } = result;
      setSelectedFilter({
        type: "geo",
        city: "Autour de moi",
        postalCode: place?.postalCode || "",
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius,
      });
      setSearchInput("");
      setSuggestions([]);
    }
  };

  const handleRemoveFilter = () => {
    setSearchInput("");
    setSuggestions([]);
    if (defaultLocation) {
      handleAroundMe();
    } else {
      setSelectedFilter(null);
    }
  };

  const handleApply = () => {
    onApply({ selectedFilter, radius });
    handleCloseBottomSheet();
  };

  const renderActiveFilter = () => {
    if (!selectedFilter) return null;

    const label =
      selectedFilter.type === "geo"
        ? `Autour de moi (${radius} km)`
        : `${selectedFilter.city} (${selectedFilter.postalCode}) - ${radius} km`;

    return (
      <View style={styles.filterChip}>
        <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
          {label}
        </Text>
        {(!defaultLocation || selectedFilter.type === "city") && (
          <TouchableOpacity
            onPress={handleRemoveFilter}
            style={{ marginLeft: 8 }}
          >
            <Text style={{ fontSize: 18, color: COLORS.gray }}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      handleComponent={null}
    >
      <BottomSheetView>
        <SafeAreaView edges={["top"]} style={{ backgroundColor: COLORS.white }}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtrer les résultats</Text>
            <TouchableOpacity
              onPress={handleCloseBottomSheet}
              style={{ padding: 8 }}
            >
              <Text style={{ fontSize: 24, color: "black" }}>×</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View
          style={{ padding: 3, flexDirection: "row", alignItems: "center" }}
        >
          <AddressSearchBar
            placeholder="On passe par où ?"
            value={searchInput}
            onChange={handleSearchChange}
            loading={searchIsLoading}
          />
        </View>

        {renderActiveFilter()}

        {!selectedFilter && suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            <SuggestionHistoryList
              data={suggestions}
              onSelect={handleSelectSuggestion}
              addressInput={searchInput}
            />
          </View>
        )}

        {!selectedFilter && (
          <TouchableOpacity
            onPress={handleAroundMe}
            style={styles.aroundMeButton}
          >
            <Text style={{ color: COLORS.white, textAlign: "center" }}>
              📍 Autour de moi
            </Text>
          </TouchableOpacity>
        )}

        <Text style={{ marginBottom: 8, marginLeft: 8 }}>
          Dans un Rayon de {radius} km
        </Text>
        <Slider
          minimumValue={1}
          maximumValue={25}
          step={1}
          value={radius}
          onValueChange={setRadius}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor="#ccc"
        />

        <TouchableOpacity onPress={handleApply} style={styles.validateButton}>
          <Text
            style={{
              color: COLORS.white,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Appliquer
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = {
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    marginLeft: 8,
  },
  suggestionsBox: {
    backgroundColor: COLORS.white,
    marginTop: 2,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  aroundMeButton: {
    marginTop: 10,
    marginBottom: 10,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignSelf: "center",
    width: "90%",
  },
  validateButton: {
    marginTop: 12,
    marginBottom: 24,
    padding: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignSelf: "center",
    width: "90%",
  },
};
