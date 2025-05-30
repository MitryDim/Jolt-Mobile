import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity,Dimensions } from "react-native";
import IconComponent from "./Icons";

 
const Card = ({
  cardWidth , 
  add = false,
  onClick,
  children,
}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.cardStyle, { width: cardWidth }]}
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
  cardStyle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    margin: 5,
    borderRadius: 15,
    elevation: 5, // ANDROID
    shadowColor: "#000", // IOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default Card;
