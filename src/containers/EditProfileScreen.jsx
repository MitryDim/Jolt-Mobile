import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../context/AuthContext";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import { useIsFocused } from "@react-navigation/native";
import LoadingOverlay from "../components/LoadingOverlay";

const EditProfileScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const fetchWithAuth = useFetchWithAuth();
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);

  console.log("EditProfileScreen user:", username);
  useEffect(() => {
    console.log("EditProfileScreen is focused:", isFocused, user);
    if (user) {
      console.log("EditProfileScreen user:1", user);
      setEmail(user.email || "");
      setUsername(user.username || "");
      setProfilePicture(user.profilePicture || "");
    }
  }, [user, isFocused]);

  const pickImage = async () => {
    Alert.alert("Modifier la photo", "Choisissez une option", [
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
            setProfilePicture(result.assets[0].uri);
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
            setProfilePicture(result.assets[0].uri);
          }
        },
      },
      { text: "Annuler", style: "cancel" },
    ]);
  };
  const validateEmail = (email) => {
    // Regex simple pour valider un email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleUpdate = async () => {
    setLoading(true);
    if (!email || !username) {
      Alert.alert("Erreur", "Email et username sont obligatoires.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Erreur", "Veuillez saisir une adresse email valide.");
      return;
    }

    const userUpdate = {
      email: email.trim(),
      username: username.trim(),
      profilePicture: profilePicture ? profilePicture : user.profilePicture,
    };


    const { error, data } = await fetchWithAuth(
      `${EXPO_GATEWAY_SERVICE_URL}/users/update/${user.id}`,
      {
        method: "PATCH",
        body: JSON.stringify(userUpdate),
      },
      { protected: true }
    );
    if (error) {
      setLoading(false);
      Alert.alert("Erreur", "La mise à jour a échoué.");
      return;
    }
    // Mets à jour le contexte utilisateur si besoin
    if (data) {
      console.log("Mise à jour du profil réussie:", data);
      const newDataUser = data.data;
      setUser((prevUser) => ({
        ...prevUser,
        email: newDataUser.email,
        username: newDataUser.username,
        profilePicture: newDataUser.profilePicture,
      }));
    }
    setLoading(false);
    Alert.alert("Succès", "Profil mis à jour.");
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {loading && (
        <LoadingOverlay>
          <Text>Chargement...</Text>
        </LoadingOverlay>
      )}

      <View style={{ alignItems: "center" }}>
        <Image
          source={
            profilePicture
              ? { uri: profilePicture }
              : require("../../assets/avatar.jpg")
          }
          resizeMode="cover"
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 10,
            backgroundColor: "#eee",
          }}
        />
        <TouchableOpacity
          onPress={pickImage}
          style={{
            backgroundColor: "#2196F3",
            padding: 10,
            borderRadius: 5,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Modifier la photo
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontWeight: "600" }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        placeholder="Email"
        placeholderTextColor="#888"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
          color: "#000",
        }}
      />

      <Text style={{ fontWeight: "600" }}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#888"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 25,
          borderRadius: 5,
          color: "#000",
        }}
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
          disabled={loading}
        >
          Enregistrer les modifications
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;
