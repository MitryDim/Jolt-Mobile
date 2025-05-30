import { View, Text, Button, Pressable, Image } from "react-native";
import React, { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Separator from "../components/Separator";
import avatar from "../../assets/avatar.jpg";
import { UserContext } from "../context";
import { useNavigation } from "@react-navigation/native";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import {EXPO_USER_SERVICE_URL} from "@env"; 
const ProfileScreen = () => {
  const navigation = useNavigation();
  const fetchWithAuth = useFetchWithAuth();

  const { user, logout } = useContext(UserContext);
  // Étape 2: Création d'un tableau de boutons
  const buttons = [
    { id: 1, title: "Modifier le profil" },
    { id: 2, title: "Paramètres" },
    { id: 3, title: "Déconnexion", onPress: () => logout() },
    {
      id: 4,
      title: "Supprimer le compte",
      PressClassName: "mt-4",
      textClassName: "text-red-500 underline",
      onPress: async () => {
        console.log("Supprimer le compte", EXPO_USER_SERVICE_URL);
        //fetch
        // Supprime le compte de l'utilisateur
        try {
          const response =
            await /* `fetchWithAuth` is a custom hook that is used to make authenticated
          API requests. It handles the process of adding authentication
          headers or tokens to the request before sending it. In the
          `ProfileScreen` component, `fetchWithAuth` is used to send a DELETE
          request to the specified URL for deleting a user account. It
          ensures that the request is made with the necessary authentication
          credentials to perform the account deletion operation securely. */
            fetchWithAuth(
              `${EXPO_USER_SERVICE_URL}/users/delete`,
              {
                method: "DELETE",
              },
              {
                protected: true,
              }
            );
          console.log("response ", response);
          if (!response.ok) {
            alert("Erreur lors de la suppression du compte.");
            return;
          }
          const data = await response.json();
          console.log("data ", data);
          if (!data?.success) {
            alert("Erreur lors de la suppression du compte.");
            return;
          }
          // Affiche un message de succès
          alert("Compte supprimé avec succès.");
          // Redirige l'utilisateur vers l'écran de connexion

          // Met à jour le contexte utilisateur
          await logout();
          // Redirige l'utilisateur vers l'écran de connexion
          navigation.navigate("Home");
        }catch (error) {
          console.error("Erreur lors de la suppression du compte:", error);
          alert("Erreur lors de la suppression du compte.");
          return;
        }
        
      },
    },
  ];

  return (
    <SafeAreaView className="flex mb-[60px]">
      <Text className="mt-4 text-xl text-center font-bold">Profil</Text>
      <Separator />

      <View className="flex items-center">
        <View className="bg-white w-32 h-32 rounded-full mt-4 overflow-hidden">
          <Image source={avatar} style={{ width: "100%", height: "100%" }} />
        </View>
      </View>

      {buttons.map((button) => (
        <View className="flex items-center" key={button.id}>
          <Pressable
            className={`${
              button.id === 4
                ? button.PressClassName
                : "bg-white w-60 px-2 py-4 m-4 rounded-lg shadow-md"
            }`}
            onPress={() => button.onPress()}
          >
            <Text
              className={`text-center ${
                button.id == 4 ? button.textClassName : ""
              }`}
            >
              {button.title}
            </Text>
          </Pressable>
        </View>
      ))}
    </SafeAreaView>
  );
};

export default ProfileScreen;
