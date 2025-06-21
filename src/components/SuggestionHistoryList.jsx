import React from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import IconComponent from "./Icons"; 

const SuggestionHistoryList = ({
  data,
  onSelect,
  isLoading,
  addressInput,
  FlatListComponent = FlatList,
}) => {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <IconComponent
        library={item.type === "history" ? "FontAwesome6" : "Feather"}
        icon={item.type === "history" ? "clock-rotate-left" : "map-pin"}
        color={"black"}
        size={18}
        style={{ marginLeft: 8, marginRight: 8 }}
      />
      <Text onPress={() => onSelect(item)} style={{ flex: 1 }}>
        {item.properties.label}
      </Text>
    </View>
  );

  return (
    <FlatListComponent
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.properties?.id}-${index}`}
      ListEmptyComponent={() =>
        !isLoading && addressInput.length > 1 ? (
          <Text style={styles.emptyText}>Aucun résultat</Text>
        ) : null
      }
    />
  );
};

export default SuggestionHistoryList;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  emptyText: {
    padding: 16,
    textAlign: "center",
    color: "#888",
  },
});
