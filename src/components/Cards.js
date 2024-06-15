import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity,Dimensions } from "react-native";
import IconComponent from "./Icons";

  const CARD_WIDTH = Dimensions.get("window").width * 0.8;
  const CARD_HEIGHT = Dimensions.get("window").height * 0.4;

const Card = ({
  cardWidth = CARD_WIDTH,
  cardHeight = CARD_HEIGHT,
  add = false,
  onClick,
  children,
}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.cardStyle, { width: cardWidth, height: cardHeight }]}
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
    backgroundColor: "green",
    margin: 5,
    borderRadius: 15,
  },
});

export default Card;
