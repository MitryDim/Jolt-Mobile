import {
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import React from "react";
import Card from "../Cards";
const { width, height } = Dimensions.get("screen");
const customWidth = width * 0.9;
const SlideItem = ({ item }) => {
  return (
    <View
      style={{
        width,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        title={item.title}
        compteur="300 km"
        image={item.img}
        cardWidth={customWidth}
        cardHeight={"95%"}
        add={item.add}
      ></Card>
    </View>
  );
};

export default SlideItem;

const styles = StyleSheet.create({
  container: {
    width: customWidth,
    height: "100%",
    alignItems: "center",
  },
  card: {
    alignItems: "center",
    width: customWidth,
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
  },
  image: {
    flex: 0.6,
    width: "100%",
  },
  content: {
    flex: 0.4,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 18,
    marginVertical: 12,
    color: "#333",
  },
  column: {
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
