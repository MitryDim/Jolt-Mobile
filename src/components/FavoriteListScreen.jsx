import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { RectButton } from "react-native-gesture-handler";
import IconComponent from "./Icons";
import { useNavigation } from "@react-navigation/native";
import { useNavigationMode } from "../context/NavigationModeContext";

const FavoriteListScreen = () => {
  const navigation = useNavigation();
  const { favoritesAddresses, setFavorites } = useNavigationMode();
  const [data, setData] = useState(favoritesAddresses);

  // Met à jour la liste globale et locale
  const updateFavorites = (newList) => {
    setData(newList);
    setFavorites(newList);
  };

  // Suppression d'un favori
  const handleDelete = (item) => {
    Alert.alert("Supprimer", `Supprimer "${item.label}" des favoris ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          const newList = data.filter((fav) => fav.id !== item.id);
          updateFavorites(newList);
        },
      },
    ]);
  };

  // Rendu d'un item avec swipe pour supprimer
  const renderItem = useCallback(
    ({ item, drag, isActive }) => (
      <RectButton
        style={[
          styles.item,
          { backgroundColor: isActive ? "#e6f7ff" : "#fff" },
        ]}
        onLongPress={drag}
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
      </RectButton>
    ),
    [data]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes favoris</Text>
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
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={({ data: newData }) => updateFavorites(newData)}
        activationDistance={10}
        containerStyle={{ flex: 1 }}
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
