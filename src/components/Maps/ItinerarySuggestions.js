import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const ItinerarySuggestions = ({ routes, onSelect }) => {
  if (!routes?.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={routes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onSelect(item, index)}
          >
            <Text style={styles.title}>Trajet {index + 1}</Text>
            <Text>Durée : {item.duration}</Text>
            <Text>Distance : {item.distance}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute", 
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    maxHeight: 300,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  title: {
    fontWeight: "bold",
  },
});

export default ItinerarySuggestions;
