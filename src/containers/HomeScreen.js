import { View, Text, StyleSheet } from "react-native";
import React from 'react'
import {
  SafeAreaView
} from "react-native-safe-area-context";
const HomeScreen = () => {
  return (
    <SafeAreaView>
      <View>
        <Text>Afficher ici le nb de km effectués au total / action à realiser sur les entretiens et photo s'il y à de la trot</Text>
        <Text>Afficher ici Dernier trajet Effectués (avec la map) avec les informations + lorsqu'on clique dessus affiché sur un screen la map du trajet, publier,petit coeur pour ajouter aux favoris etc </Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
}); 

export default HomeScreen