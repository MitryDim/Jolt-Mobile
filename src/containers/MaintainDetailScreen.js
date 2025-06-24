import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import WearBar from "../components/WearBar";

const MaintainDetailScreen = ({ route, navigation }) => {
  const { maintain, vehicle } = route.params;
  const [mileage, setMileage] = useState(vehicle.mileage?.toString() || "");
  const fetchWithAuth = useFetchWithAuth();
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    const { data, error } = await fetchWithAuth(
      `${EXPO_GATEWAY_SERVICE_URL}/maintainHistory`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mileage: Number(mileage),
          vehicle: vehicle.id,
          type: maintain._id,
        }),
      },
      { protected: true }
    );

    await fetchWithAuth(
      `${EXPO_GATEWAY_SERVICE_URL}/vehicle/${vehicle.id}/updateMileage`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mileage: Number(mileage) }),
      },
      { protected: true }
    );

    vehicle.mileage = Number(mileage);
    setLoading(false);
    if (error) {
      Alert.alert("Erreur", error);
    } else {
      Alert.alert("Succès", "Historique de maintenance créé !");
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{maintain.name}</Text>
      <WearBar percent={maintain.wearPercentage || 0} />
      <Text style={styles.label}>Description :</Text>
      <Text style={styles.desc}>
        {maintain.description || "Aucune description."}
      </Text>
      <Text style={styles.label}>Kilométrage actuel :</Text>
      <TextInput
        style={styles.input}
        value={mileage}
        onChangeText={setMileage}
        keyboardType="numeric"
      />
      <Button
        title={loading ? "Envoi..." : "Remise à zéro"}
        onPress={handleReset}
        disabled={loading}
        color="#70E575"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  label: { fontWeight: "bold", marginTop: 16 },
  desc: { marginTop: 4, color: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    marginBottom: 20,
  },
});

export default MaintainDetailScreen;
