import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AddressSearchBar from "./AddressSearchBar";
import SuggestionHistoryList from "./SuggestionHistoryList";
import { useNavigationMode } from "../context/NavigationModeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, {
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import ActivityIndicator from "./ActivityIndicator";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
const AddFavoriteAddressScreen = ({ navigation }) => {
  const { favoritesAddresses, fetchFavorites } = useNavigationMode();
  const [addressInput, setAddressInput] = useState("");
  const [addressLabel, setAddressLabel] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [labelInput, setLabelInput] = useState("");
  const [saving, setSaving] = useState(false);
  const bottomSheetRef = useRef(null);
  const fetchWithAuth = useFetchWithAuth();

  useEffect(() => {
    AsyncStorage.getItem("searchHistory").then((data) => {
      if (data) setHistory(JSON.parse(data));
    });
  }, []);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     fetchFavorites();
  //   }, [])
  // );
  const fetchSuggestions = async (input) => {
    console.log("Fetching suggestions for input:", input);
    if (!input) return setSuggestions([]);
    setIsLoading(true);
    try {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        input
      )}&autocomplete=1&limit=5`;
      const res = await fetch(url);
      const json = await res.json();
      console.log("Suggestions fetched:", json?.features);
      if (!json.features || json.features.length === 0) {
        setSuggestions([]);
        return;
      }
      setSuggestions(json.features);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (text) => {
    setAddressInput(text);
    console.log("Input changed:", text);
    console.log("Current timeout ID:", timeoutId);
    if (timeoutId) clearTimeout(timeoutId);
    const newId = setTimeout(() => fetchSuggestions(text), 500);
    setTimeoutId(newId);
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    setLabelInput("");
    setModalVisible(true);
    setTimeout(() => bottomSheetRef.current?.expand(), 100); // pour bien ouvrir le BottomSheet
  };

  const handleSaveFavorite = async () => {
    if (!labelInput.trim()) {
      Alert.alert(
        "Erreur",
        "Merci de saisir un nom pour cette adresse favorite."
      );
      return;
    }
    setSaving(true);
    try {
      const body = {
        label: labelInput,
        addressName: selectedItem?.properties?.label,
        lat: selectedItem?.geometry?.coordinates?.[1],
        lon: selectedItem?.geometry?.coordinates?.[0],
      };
      const { data, error } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/favorite-addresses`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        { protected: true }
      );
      if (!error) {
        setModalVisible(false);
        setSelectedItem(null);
        setLabelInput("");
        // Optionnel : rafraîchir la liste des favoris
        fetchFavorites?.();
        Alert.alert("Succès", "Adresse favorite ajoutée !");
        navigation.goBack();
      } else {
        Alert.alert("Erreur", "Impossible d'ajouter le favori.");
      }
    } catch (e) {
      Alert.alert("Erreur", "Une erreur est survenue.");
    }
    setSaving(false);
  };
  const filtredHistory = useMemo(() => {
    if (addressInput.length === 0) return history;
    return history.filter((h) =>
      h.properties?.label?.toLowerCase()?.includes(addressInput?.toLowerCase())
    );
  }, [addressInput, history]);

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

  return (
    <View style={styles.container}>
      <AddressSearchBar
        placeholder="Rechercher une adresse"
        onChange={handleInputChange}
        value={addressInput}
      />

      <SuggestionHistoryList
        data={combinedData}
        onSelect={handleSelect}
        isLoading={isLoading}
        addressInput={addressInput}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}
            >
              Nom du favori
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex : Maison, Travail..."
              value={labelInput}
              onChangeText={setLabelInput}
              placeholderTextColor="#888"
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.button,
                { opacity: saving ? 0.7 : 1, width: "100%", marginBottom: 12 },
              ]}
              onPress={handleSaveFavorite}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 14,
                alignItems: "center",
                width: "100%",
              }}
              onPress={() => setModalVisible(false)}
              disabled={saving}
            >
              <Text style={{ color: "#007aff", fontSize: 16 }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddFavoriteAddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  button: {
    backgroundColor: "#007aff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#007aff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    alignItems: "center",
    elevation: 8,
  },
});
