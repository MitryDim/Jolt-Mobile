import { View, Text, Button, Pressable } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Separator from "../components/Separator";

const SettingsProfileScreen = () => {
  // Étape 2: Création d'un tableau de boutons
  const buttons = [
    { id: 1, title: "Modifier le profil" },
    { id: 2, title: "Paramètres" },
    { id: 3, title: "Déconnexion" },
  ];

  return (
    <SafeAreaView className="flex mb-[60px]">
      <Text className="mt-4 text-xl text-center font-bold">Profile</Text>
      <Separator />
      {buttons.map((button) => (
        <Pressable
          className="bg-white px-2 py-4 m-4 rounded-lg shadow-md"
          onPress={() => console.log(button.title + " pressé")}
        >
          <Text className="text-center">{button.title}</Text>
        </Pressable>
      ))}
    </SafeAreaView>
  );
};

export default SettingsProfileScreen;
