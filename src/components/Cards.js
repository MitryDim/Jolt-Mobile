import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const Card = ({ title, description, image,add }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.row, { gap: 6, justifyContent: "center" ,width:'60%'}]}>
          <View style={styles.column}>
            <Text style={styles.smallText}>{"Compteur"}</Text>
            <Text>{description}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.smallText}>{"Entretient"}</Text>
            <Text>{description}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: "white",
    flex: 1,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 8,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    height: '90%',
    width: '40%',
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  column: {
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  smallText: {
    fontSize: 14,
    color: "#808080",
  },
});

export default Card;
