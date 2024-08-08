import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import "nativewind";

export default function AddScooterForm() {
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  const handleSubmit = () => {
    // Vous pouvez ajouter une logique de validation ici si nécessaire

    // Pour l'instant, nous allons simplement afficher une alerte avec les informations saisies
    Alert.alert(
      "Trottinette ajoutée",
      `Modèle: ${model}, Marque: ${brand}, Couleur: ${color}, Numéro de série: ${serialNumber}`
    );

    // Réinitialiser les champs après soumission
    setModel("");
    setBrand("");
    setColor("");
    setSerialNumber("");
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-lg mb-2">Modèle:</Text>
      <TextInput
        className="border border-gray-400 p-2 mb-4"
        value={model}
        onChangeText={setModel}
        placeholder="Entrez le modèle"
      />

      <Text className="text-lg mb-2">Marque:</Text>
      <TextInput
        className="border border-gray-400 p-2 mb-4"
        value={brand}
        onChangeText={setBrand}
        placeholder="Entrez la marque"
      />

      <Text className="text-lg mb-2">Couleur:</Text>
      <TextInput
        className="border border-gray-400 p-2 mb-4"
        value={color}
        onChangeText={setColor}
        placeholder="Entrez la couleur"
      />

      <Text className="text-lg mb-2">Numéro de série:</Text>
      <TextInput
        className="border border-gray-400 p-2 mb-4"
        value={serialNumber}
        onChangeText={setSerialNumber}
        placeholder="Entrez le numéro de série"
      />

      <Button title="Ajouter Trottinette" onPress={handleSubmit} />
    </View>
  );
}
