import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";

const AddScooterForm = ({ onAdd }) => {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [mileage, setMileage] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchWithAuth = useFetchWithAuth();

  const handleSubmit = async () => {
    if (!brand || !model || !purchaseDate || !mileage) {
      Alert.alert("Erreur", "Merci de remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    const { data, error } = await fetchWithAuth(
      `${EXPO_GATEWAY_SERVICE_URL}/vehicle`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          model,
          firstPurchaseDate: purchaseDate,
          mileage,
          image,
        }),
      },
      { protected: true }
    );
    setLoading(false);
    if (error) {
      Alert.alert("Erreur", error);
    } else {
      Alert.alert("Succès", "Scooter ajouté !");
      setBrand("");
      setModel("");
      setpurchaseDate("");
      setMileage("");
      setImage("");
      if (onAdd) onAdd(); // Pour rafraîchir la liste si besoin
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Ajouter un scooter</Text>
      <TextInput
        style={styles.input}
        placeholder="Marque"
        value={brand}
        onChangeText={setBrand}
      />
      <TextInput
        style={styles.input}
        placeholder="Modèle"
        value={model}
        onChangeText={setModel}
      />
      <TextInput
        style={styles.input}
        placeholder="Année"
        value={purchaseDate}
        onChangeText={setPurchaseDate}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Kilométrage"
        value={mileage}
        onChangeText={setMileage}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="URL de l'image (optionnel)"
        value={image}
        onChangeText={setImage}
      />
      <Pressable
        style={[styles.button, loading && { backgroundColor: "#ccc" }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Ajout..." : "Ajouter"}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#70E575",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AddScooterForm;
