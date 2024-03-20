import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import IconComponent from "./Icons";

const Card = ({ title, compteur, image, cardWidth,cardHeight, add = false, }) => {
  let customWidth = "100%";
  let customHeight = "100%";

  if (cardHeight) customHeight = cardHeight;
  if (cardWidth) customWidth = cardWidth;

  return (
    <View style={[styles.card, { width: customWidth, height: customHeight }]}>
      {add ? (
        <>
          <Text style={{ flex: 1, fontSize: 16 }}>{title}</Text>
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
        <View
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: image }}
            resizeMode="contain"
            style={[styles.image]}
          />
          <Text style={{ fontSize: 16, fontWeight:'700', top:3 }}>{title}</Text>
          <View
            style={[
              styles.row,
              {
                gap: "100%",
                justifyContent: "center",
                width: "100%",
                top: "5%",
              },
            ]}
          >
            <View style={[styles.column]}>
              <Text style={styles.smallText}>{"Compteur"}</Text>
              <Text>{compteur}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.smallText}>{"Entretient"}</Text>
              <Text>7 à faire</Text>
            </View>
          </View>
        </View>
      )}
    </View>
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
  image: {
    flex: 0.6,
    width: "100%",
  },
  content: {
    flex: 0.4,
    alignItems: "center",
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
