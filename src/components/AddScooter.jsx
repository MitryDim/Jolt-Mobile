import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Keyboard } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation } from "@react-navigation/native";
const AddScooterForm = ({ onAdd, navigation: navigationProp }) => {
  const navigation = navigationProp || useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [mileage, setMileage] = useState("");
  const [image, setImage] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchWithAuth = useFetchWithAuth();

  // Fonction pour choisir une image
  const pickImage = async () => {
    Alert.alert("Ajouter une image", "Choisissez une option", [
      {
        text: "Prendre une photo",
        onPress: async () => {
          // Demande la permission caméra AVANT d'ouvrir la caméra
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission refusée",
              "La permission d'accéder à la caméra est requise."
            );
            return;
          }
          let result = await ImagePicker.launchCameraAsync({
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
          // Demande la permission galerie AVANT d'ouvrir la galerie
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission refusée",
              "La permission d'accéder à la galerie est requise."
            );
            return;
          }
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.IMAGE,
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

  // Fonction utilitaire pour afficher la date en français
  const formatDateFR = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    if (!brand || !model || !purchaseDate || !mileage) {
      Alert.alert("Erreur", "Merci de remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("brand", brand);
    formData.append("model", model);
    formData.append("firstPurchaseDate", purchaseDate);
    formData.append("mileage", mileage);
    if (imageUri) {
      formData.append("image", {
        uri: imageUri,
        name: "photo.jpg",
        type: "image/*",
      });
    }

    const { data, error } = await fetchWithAuth(
      `${EXPO_GATEWAY_SERVICE_URL}/vehicle`,
      {
        method: "POST",
        body: formData,
      },
      { protected: true }
    );
    setLoading(false);
    if (error) {
      Alert.alert("Erreur", error);
    } else {
 

      if (onAdd) onAdd();

      Alert.alert("Succès", "Scooter ajouté !", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView>
      <View style={styles.formContainer}>
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
          place
        />
        <TouchableOpacity
          style={styles.input}
          onPress={() => {
            Keyboard.dismiss();
            setDatePickerVisibility(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={{ color: purchaseDate ? "#000" : "#888" }}>
            {purchaseDate
              ? formatDateFR(purchaseDate)
              : "Date d'achat (JJ/MM/AAAA)"}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          locale="fr-FR"
          date={purchaseDate ? new Date(purchaseDate) : new Date()}
          onConfirm={(selectedDate) => {
            setDatePickerVisibility(false);
            if (selectedDate) {
              const iso = selectedDate.toISOString().split("T")[0];
              setPurchaseDate(iso);
            }
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />
        <TextInput
          style={styles.input}
          placeholder="Kilométrage"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
        />
        <Pressable style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>
            {imageUri ? "Changer l'image" : "Choisir une image"}
          </Text>
        </Pressable>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: 100,
              height: 100,
              marginVertical: 10,
              alignSelf: "center",
            }}
          />
        ) : null}
        <Pressable
          style={[styles.button, loading && { backgroundColor: "#ccc" }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Ajout..." : "Ajouter"}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={purchaseDate ? new Date(purchaseDate) : new Date()}
            mode="date"
            display="default"
            locale="fr-FR"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const iso = selectedDate.toISOString().split("T")[0];
                setPurchaseDate(iso);
              }
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
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
    margin: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AddScooterForm;
