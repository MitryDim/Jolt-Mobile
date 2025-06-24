import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { RectButton } from "react-native-gesture-handler";
import IconComponent from "./Icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useNavigationMode } from "../context/NavigationModeContext";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
const FavoriteListScreen = () => {
  const navigation = useNavigation();
  const fetchWithAuth = useFetchWithAuth();
  const { favoritesAddresses, setFavorites, fetchFavorites } =
    useNavigationMode();
  const [data, setData] = useState(favoritesAddresses);

  useFocusEffect(
    useCallback(() => {
      // Récupère les favoris à chaque fois que l'écran est focalisé
      fetchFavorites();
    }, [])
  );

  useEffect(() => {
    setData(favoritesAddresses);
  }, [favoritesAddresses]);
  // Met à jour la liste globale et locale
  const updateFavorites = (newList) => {
    fetchFavorites();
  };

  const updateFavoritePosition = async (id, newPosition) => {
    console.log("Updating position for favorite:", id, newPosition);
    try {
      await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/favorite-addresses/${id}/position`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: newPosition }),
        },
        { protected: true }
      );
    } catch (e) {
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour la position du favori."
      );
    }
  };

  const updatePositionFavorites = async (newList) => {
    // Recherche le favori dont la position a changé
    for (let i = 0; i < newList.length; i++) {
      if (newList[i]._id !== data[i]._id) {
        // On a trouvé le favori déplacé
        await updateFavoritePosition(newList[i]._id, i);
        setData(newList);
        break;
      }
    }
    fetchFavorites();
  };

  const deleteFavorite = async (id) => {
    try {
      await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/favorite-addresses/${id}`,
        {
          method: "DELETE",
        },
        { protected: true }
      );
      // Met à jour la liste des favoris après suppression
      fetchFavorites();
    } catch (e) {
      Alert.alert("Erreur", "Impossible de supprimer le favori.");
    }
  };

  // Suppression d'un favori
  const handleDelete = (item) => {
    Alert.alert("Supprimer", `Supprimer "${item.label}" des favoris ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          deleteFavorite(item._id);
        },
      },
    ]);
  };

  // Rendu d'un item avec swipe pour supprimer
  const renderItem = useCallback(
    ({ item, drag, isActive }) => (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.item,
            { backgroundColor: isActive ? "#e6f7ff" : "#fff" },
          ]}
        >
          <IconComponent
            library="Feather"
            icon="menu"
            size={20}
            color="#888"
            style={{ marginRight: 12 }}
          />

          <Text style={styles.label}>{item.label}</Text>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}
          >
            <IconComponent
              library="Feather"
              icon="trash-2"
              size={20}
              color="#e74c3c"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    ),
    [data]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddFavoriteAddress")}
        >
          <IconComponent
            library="Feather"
            icon="plus"
            size={22}
            color="#007AFF"
          />
          <Text style={styles.addButtonText}>Nouveau</Text>
        </TouchableOpacity>
      </View>
      <DraggableFlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        onDragEnd={({ data: newData }) => updatePositionFavorites(newData)}
        containerStyle={{ flex: 1 }}
        activationDistance={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf4ff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  label: { flex: 1, fontSize: 16, color: "#222" },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default FavoriteListScreen;
