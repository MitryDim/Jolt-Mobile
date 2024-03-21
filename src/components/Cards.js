import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import IconComponent from "./Icons";

const Card = ({cardWidth='100%',cardHeight='100%', add = false,onClick,children }) => {
 return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.card, { width: cardWidth, height: cardHeight }]}
    >
      {add ? (
        <>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <IconComponent
              library="MaterialCommunityIcons"
              name="plus"
              style={{ color: "#70E575" }}
              size={60}
            />
          </View>
        </>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {

    height: "95%",
    backgroundColor: "white",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});

export default Card;
