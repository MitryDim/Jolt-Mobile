import React from "react";
import { FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";

const FavoriteList = ({
  favorites,
  onSelect,
  onAddNew,
  maxVisible = 3,
  showMore,
}) => {
  return (
    <FlatList
      data={favorites.slice(0, maxVisible)}
      horizontal
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.favoriteItem}
          onPress={() => onSelect(item)}
        >
          <Text numberOfLines={1} ellipsizeMode="tail" className="text-center ">
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.favoritesList}
      showsHorizontalScrollIndicator={false}
      ListFooterComponent={() =>
        favorites.length <= maxVisible ? (
          <TouchableOpacity style={styles.addButton} onPress={onAddNew}>
            <Text style={styles.addFavoriteButton}>+ Nouveau</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={showMore}>
            <Text style={styles.addFavoriteButton}>Afficher plus</Text>
          </TouchableOpacity>
        )
      }
    />
  );
};

export default FavoriteList;

const styles = StyleSheet.create({
  favoriteItem: {
    padding: 8,
    marginRight: 8,
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    width: 80,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  addFavoriteButton: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    includeFontPadding: false,
    textAlign: "center",
  },
  favoritesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff",
    borderRadius: 8,
    height: 45,
    width: 100,
  },
});
