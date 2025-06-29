import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Slider from "@react-native-community/slider";
import AddressSearchBar from "./SearchBar";
import SuggestionHistoryList from "./SuggestionHistoryList";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
export default function FilterBottomSheet({
  onApply,
  initialRadius = 10,
  initialSelectedFilter = null,
  bottomSheetRef,
  handleCloseBottomSheet = () => {},
}) {
  const snapPoints = useMemo(() => ["100%"]);
  const [radius, setRadius] = useState(initialRadius);
  const [selectedFilter, setSelectedFilter] = useState(initialSelectedFilter);
  const [suggestions, setSuggestions] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchisLoading, setSearchIsLoading] = useState(false);

  // Remettre à zéro quand on ouvre le filtre
  useEffect(() => {
    setRadius(initialRadius);
    setSelectedFilter(initialSelectedFilter);
    setSearchInput("");
    setSuggestions([]);
  }, [initialRadius, initialSelectedFilter]);

  // Gestion du changement de recherche
  const handleSearchChange = (text) => {
    setSearchInput(text);
    if (text.trim() === "") {
      setSuggestions([]);
      setSearchIsLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
      // Si on efface, on retire le filtre ville
      if (selectedFilter?.type === "city") setSelectedFilter(null);
      return;
    }
    // Si on tape, on retire le filtre "autour de moi"
    if (selectedFilter?.type === "geo") setSelectedFilter(null);
    if (timeoutId) clearTimeout(timeoutId);
    const newId = setTimeout(() => {
      setSearchIsLoading(true);
      fetchSuggestions(text);
    }, 500);
    setTimeoutId(newId);
  };

  // Suggestions API
  const fetchSuggestions = async (input) => {
    if (!input) return setSuggestions([]);
    try {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        input
      )}&type=municipality&autocomplete=1&limit=5`;
      const res = await fetch(url);
      const json = await res.json();
      setSuggestions(json.features || []);
    } catch (err) {
      setSuggestions([]);
    } finally {
      setSearchIsLoading(false);
    }
  };

  // Sélection d'une suggestion ville
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

  const handleApply = () => {
    onApply({
      selectedFilter,
      radius,
    });
    handleCloseBottomSheet();
  };

  const handleReset = () => {
    setRadius(initialRadius);
    setSelectedFilter(initialSelectedFilter);
    setSearchInput("");
    setSuggestions([]);
    //  onReset();
    handleCloseBottomSheet();
  };

  const getCurrentPosition = async () => {
    console.log("Fetching current position...");
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});

    let [place] = await Location.reverseGeocodeAsync(location.coords);

    if (place && place.city) {
      setSelectedFilter({
        type: "geo",
        city: "Autour de moi",
        postalCode: place.postalCode || "",
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius,
      });
    } else {
      setSelectedFilter({ radius });
      console.warn("No city found for current location");
    }
  };

  // Sélection "Autour de moi"
  const handleAroundMe = async () => {
    //  await onGetCurrentPosition();
    await getCurrentPosition();
    setSearchInput("");
    setSuggestions([]);
  };

  // Suppression du filtre actif
  const handleRemoveFilter = () => {
    setSelectedFilter(null);
    setSearchInput("");
    setSuggestions([]);
  };

  // Validation
  const handleValidate = () => {
    onValidate(radius);
    handleCloseBottomSheet();
  };

  // Affichage du chip filtre actif
  const renderActiveFilter = () => {
    if (!selectedFilter) return null;
    let label = "";
    if (selectedFilter.type === "geo") {
      label = `Autour de moi (${radius} km)`;
    } else if (selectedFilter.type === "city") {
      label = `${selectedFilter.city} (${selectedFilter.postalCode}) - ${radius} km`;
    }
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: "#f1f5f9",
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
          marginTop: 8,
          marginLeft: 8,
        }}
      >
        <Text style={{ color: "#007bff", fontWeight: "bold" }}>{label}</Text>
        <TouchableOpacity
          onPress={handleRemoveFilter}
          style={{ marginLeft: 8 }}
        >
          <Text style={{ fontSize: 18, color: "#888" }}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      handleComponent={null}
    >
      <BottomSheetView>
        <SafeAreaView edges={["top"]} style={{ backgroundColor: "white" }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-200 max-h-16">
            <View className="flex-1 items-center">
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Filtrer les résultats
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCloseBottomSheet}
              style={{ padding: 8 }}
            >
              <Text style={{ fontSize: 24, color: "black" }}>×</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* SearchBar */}
        <View
          style={{ padding: 3, flexDirection: "row", alignItems: "center" }}
        >
          <AddressSearchBar
            placeholder="On passe par où ?"
            value={searchInput}
            onChange={handleSearchChange}
            loading={searchisLoading}
          />
        </View>

        {/* Chip filtre actif */}
        {renderActiveFilter()}

        {/* Suggestions */}
        {!selectedFilter && suggestions.length > 0 && (
          <View
            style={{
              backgroundColor: "white",
              marginTop: 2,
              marginBottom: 8,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
              zIndex: 10,
            }}
          >
            <SuggestionHistoryList
              data={suggestions}
              onSelect={handleSelectSuggestion}
              addressInput={searchInput}
            />
          </View>
        )}

        {/* Bouton Autour de moi */}
        {!selectedFilter && (
          <TouchableOpacity
            onPress={handleAroundMe}
            style={{
              marginTop: 10,
              marginBottom: 10,
              padding: 12,
              backgroundColor: "#007bff",
              borderRadius: 8,
              alignSelf: "center",
              width: "90%",
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              📍 Autour de moi
            </Text>
          </TouchableOpacity>
        )}

        {/* Slider */}
        <Text style={{ marginBottom: 8, marginLeft: 8 }}>
          Dans un Rayon de {radius} km
        </Text>
        <Slider
          minimumValue={1}
          maximumValue={25}
          step={1}
          value={radius}
          onValueChange={setRadius}
          minimumTrackTintColor="#007bff"
          maximumTrackTintColor="#ccc"
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
            width: "90%",
            alignSelf: "center",
          }}
        >
          <TouchableOpacity
            onPress={handleReset}
            style={{
              padding: 12,
              backgroundColor: "#e5e7eb",
              borderRadius: 8,
              flex: 1,
              marginRight: 8,
            }}
          >
            <Text style={{ color: "#111", textAlign: "center" }}>
              Réinitialiser
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleApply}
            style={{
              padding: 12,
              backgroundColor: "green",
              borderRadius: 8,
              flex: 1,
              marginLeft: 8,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Appliquer
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
