import React from "react";
import { FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
 
const FavoriteList = ({ favorites, onSelect, onAddNew, maxVisible = 3,showMore }) => {
  return (
    <FlatList
      data={favorites}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.favoriteItem}
          onPress={() => onSelect(item)}
        >
          <Text>{item.label}</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.favoritesList}
      showsHorizontalScrollIndicator={false}
      ListFooterComponent={() =>
        favorites.length <= maxVisible ? (
          <Text style={styles.addFavoriteButton} onPress={onAddNew}>
            + Nouveau
          </Text>
        ) : (
          <Text style={styles.addFavoriteButton} onPress={showMore}>
            Afficher plus
          </Text>
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
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  addFavoriteButton: {
    marginLeft: 8,
    color: "#007bff",
  },
  favoritesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
