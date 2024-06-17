import React from "react";
import { View, ActivityIndicator, StyleSheet, Text, Image } from "react-native";
import LottieView from "lottie-react-native";

const LoadingOverlay = (props) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.loaderContainer}>
        <Image
          source={require("./../../assets/shr6qqlaud_106b4b20.gif")}
          style={{
            width: 200,
            height: 188,
            marginTop: -30,
            transform: [{ scaleX: -0.9 }, { scaleY: 0.9 }],
          }}
        />
        {props.children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0)",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  loaderContainer: {
    width: 250,
    height: 200,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Couleur de fond blanche pour le conteneur de l'ActivityIndicator
    padding: 20, // Espace de remplissage autour de l'ActivityIndicator
    borderRadius: 10, // Bord arrondi pour le conteneur
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoadingOverlay;
