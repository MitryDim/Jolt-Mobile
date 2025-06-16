import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const HeaderMap = ({ onBack, destination }) => (
  <View className="flex-row items-center justify-between px-4 py-2 bg-white shadow-md">
    {/* Flèche retour */}
    <TouchableOpacity onPress={onBack} className="p-2">
      <MaterialIcons name="arrow-back" size={28} color="#3498db" />
    </TouchableOpacity>
    {/* Titre centré */}
    <View className="flex-1 items-center">
      <Text className="font-bold text-base text-gray-800">
        Votre position <Text className="text-blue-500">→</Text> {destination}
      </Text>
    </View>
    <View style={{ width: 40 }} />
  </View>
);

export default HeaderMap;
