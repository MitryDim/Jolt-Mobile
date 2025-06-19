import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const AddFavoriteAddressScreen = () => {
  const navigation = useNavigation();
  const [addressLabel, setAddressLabel] = useState("");

  const handleAddFavorite = () => {
    if (addressLabel.trim() === "") {
      Alert.alert(
        "Erreur",
        "Merci de saisir un nom pour cette adresse favorite."
      );
      return;
    }

    // Ici tu pourrais ajouter l'adresse dans un store global, une API ou un contexte
    console.log("Nouvelle adresse favorite :", addressLabel);

    // Retour à l'écran précédent
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter une adresse favorite</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom de l'adresse (ex : Maison)"
        value={addressLabel}
        onChangeText={setAddressLabel}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddFavorite}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </TouchableOpacity>
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
});
