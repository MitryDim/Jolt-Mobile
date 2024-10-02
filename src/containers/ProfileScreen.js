import { View, Text, Button, Pressable, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Separator from "../components/Separator";
import avatar from "../../assets/avatar.jpg";

const ProfileScreen = () => {
  // Étape 2: Création d'un tableau de boutons
  const buttons = [
    { id: 1, title: "Modifier le profil" },
    { id: 2, title: "Paramètres" },
    { id: 3, title: "Déconnexion" },
    {
      id: 4,
      title: "Supprimer le compte",
      PressClassName: "mt-4",
      textClassName: "text-red-500 underline",
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
            onPress={() => console.log(button.title + " pressé")}
          >
            <Text className={`text-center ${button.id == 4 ? button.textClassName : ""}`}>
              {button.title}
            </Text>
          </Pressable>
        </View>
      ))}
    </SafeAreaView>
  );
};

export default ProfileScreen;
