import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import IconComponent from "./Icons";
import ActivityIndicator from "./ActivityIndicator";

const SearchBar = ({
  placeholder = "Où allons-nous ?",
  value = "",
  onChange = () => {},
  loading = false,
  TextInputComponent = TextInput,
}) => {
  const clearSearch = () => {
    console.log("Clear search");
    onChange("");
  };

  return (
    <View style={styles.inputContainer}>
      <IconComponent
        icon="search"
        library="Feather"
        size={20}
        style={styles.icon}
      />

      <TextInputComponent
        placeholder={placeholder}
        style={styles.input}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChange}
      />

      {/* Icône ou loader à droite du champ */}
      {loading ? (
        <ActivityIndicator
          size={20}
          testID="activity-indicator"
          style={{ marginLeft: 8 }}
        />
      ) : value.length > 0 ? (
        <IconComponent
          icon="close"
          library="MaterialIcons"
          size={20}
          onPress={clearSearch}
          style={{ marginLeft: 8 }}
        />
      ) : null}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
});
