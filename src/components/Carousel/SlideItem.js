import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Image
} from "react-native";
import React from "react";
import Card from "../Cards";
import { useNavigation } from "@react-navigation/native";
const { width, height } = Dimensions.get("screen");
const customWidth = width * 0.9;
const SlideItem = ({ item }) => {

  const navigation = useNavigation();
  return (
    <View
    className=" h-full, justify-center items-center"
    >
      <Card
        cardWidth={customWidth}
        cardHeight={"95%"}
        add={item.add}
        onClick={() => navigation.navigate("Maintains")}
      >
        <View
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: item.img }}
            resizeMode="contain"
            style={[styles.image]}
          />
          <Text style={{ fontSize: 16, fontWeight: "700", top: 3 }}>
            {item.title}
          </Text>
          <View
            style={[
              styles.row,
              {
                justifyContent: "center",
                width: "100%",
                top: "5%",
              },
            ]}
          >
            <View style={[styles.column, { marginRight: "30%" }]}>
              <Text style={styles.smallText}>{"Compteur"}</Text>
              <Text>{"compteur"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.smallText}>{"Entretien"}</Text>
              <Text>7 à faire</Text>
            </View>
          </View>
        </View>
      </Card>
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
