import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import IconComponent from "./Icons";
import ActivityIndicator from "./ActivityIndicator";

const AddressSearchBar = ({
    placeholder = "Où allons-nous ?",
  value,
  onChange,
  loading = false,
  TextInputComponent = TextInput,
}) => {
  const clearSearch = () => {
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
      {loading && (
        <ActivityIndicator
          size={20}
          testID="activity-indicator"
        ></ActivityIndicator>
      )}
      {!loading && value.length > 0 && (
        <IconComponent
          icon="close"
          library="MaterialIcons"
          size={20}
          onPress={clearSearch}
          className="cursor-pointer hover:bg-white"
        />
      )}
    </View>
  );
};

export default AddressSearchBar;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
  },
});
