import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import IconComponent from "./Icons";

const AddressSearchBar = ({ value, onChange, TextInputComponent = TextInput }) => {
  return (
    <View style={styles.inputContainer}>
      <IconComponent
        icon="search"
        library="Feather"
        size={20}
        style={styles.icon}
      />
      <TextInputComponent
        placeholder="Où allons-nous ?"
        style={styles.input}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChange}
      />
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
