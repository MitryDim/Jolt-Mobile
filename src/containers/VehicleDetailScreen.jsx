import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const VehicleDetailScreen = ({ route, navigation }) => {
  const { vehicle } = route.params;
  const fetchWithAuth = useFetchWithAuth();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [mileage, setMileage] = useState(vehicle.mileage);
  const [firstPurchaseDate, setFirstPurchaseDate] = useState(
    vehicle.firstPurchaseDate
  );
  const [imageUri, setImageUri] = useState(vehicle.img);

  const pickImage = async () => {
    Alert.alert("Modifier l'image", "Choisissez une option", [
      {
        text: "Prendre une photo",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission refusée",
              "La permission d'accéder à la caméra est requise."
            );
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
          });
          if (!result.canceled) {
            setImageUri(result.assets[0].uri);
          }
        },
      },
      {
        text: "Choisir dans la galerie",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission refusée",
              "La permission d'accéder à la galerie est requise."
            );
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
          });
          if (!result.canceled) {
            setImageUri(result.assets[0].uri);
          }
        },
      },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const handleDelete = async () => {
    Alert.alert("Confirmation", "Supprimer ce véhicule ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            const { error } = await fetchWithAuth(
              `${EXPO_GATEWAY_SERVICE_URL}/vehicle/${vehicle.id}`,
              { method: "DELETE" },
              { protected: true }
            );
            if (error) {
              Alert.alert("Erreur", "La suppression a échoué.");
              return;
            }
            Alert.alert("Succès", "Véhicule supprimé.");
            navigation.goBack();
          } catch (e) {
            Alert.alert("Erreur", "Impossible de supprimer le véhicule.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleUpdate = async () => {
    const newMileage = Number(mileage);
    const currentMileage = Number(vehicle.mileage);

    if (isNaN(newMileage) || newMileage < currentMileage) {
      Alert.alert(
        "Erreur",
        `Le kilométrage ne peut pas être inférieur à l'actuel (${currentMileage} km).`
      );
      return;
    }

    const formData = new FormData();
    formData.append("mileage", newMileage);
    formData.append("firstPurchaseDate", firstPurchaseDate);

    if (imageUri && imageUri !== vehicle.img) {
      formData.append("image", {
        uri: imageUri,
        name: "updated_photo.jpg",
        type: "image/*",
      });
    }

    try {
      const { error } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/vehicle/${vehicle.id}`,
        {
          method: "PATCH",
          body: formData,
        },
        { protected: true } 
      );
      if (error) {
        console.error("Erreur lors de la mise à jour :", error);
        Alert.alert("Erreur", "La mise à jour a échoué.");
        return;
      }
      Alert.alert("Succès", "Véhicule mis à jour.");
    } catch (e) {
      Alert.alert("Erreur", "Impossible de mettre à jour.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Image
        source={{ uri: imageUri }}
        resizeMode="contain"
        style={{
          width: "100%",
          height: 200,
          borderRadius: 10,
          marginBottom: 10,
        }}
      />
      <TouchableOpacity
        onPress={pickImage}
        style={{
          backgroundColor: "#2196F3",
          padding: 12,
          borderRadius: 5,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Modifier l'image
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        {vehicle.title}
      </Text>

      <Text style={{ fontWeight: "600" }}>Kilométrage (km)</Text>
      <TextInput
        value={mileage.toString()}
        onChangeText={setMileage}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
        }}
      />

      <Text style={{ fontWeight: "600" }}>Date d'achat</Text>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 25,
          borderRadius: 5,
        }}
        onPress={() => {
          Keyboard.dismiss();
          setDatePickerVisibility(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={{ color: firstPurchaseDate ? "#000" : "#888" }}>
          {firstPurchaseDate
            ? new Date(firstPurchaseDate).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "Date d'achat (JJ/MM/AAAA)"}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        locale="fr-FR"
        date={firstPurchaseDate ? new Date(firstPurchaseDate) : new Date()}
        onConfirm={(selectedDate) => {
          setDatePickerVisibility(false);
          if (selectedDate) {
            const iso = selectedDate.toISOString().split("T")[0];
            setFirstPurchaseDate(iso);
          }
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />

      <TouchableOpacity
        onPress={handleUpdate}
        style={{
          backgroundColor: "#4CAF50",
          padding: 15,
          borderRadius: 5,
          marginBottom: 15,
        }}
      >
        <Text
          style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
        >
          Mettre à jour les infos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDelete}
        style={{
          backgroundColor: "#F44336",
          padding: 15,
          borderRadius: 5,
        }}
      >
        <Text
          style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
        >
          Supprimer le véhicule
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default VehicleDetailScreen;
