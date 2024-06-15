import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import datas from "../Data/index";
import Card from "../components/Cards";
import IconComponent from "../components/Icons";
import { TouchableOpacity } from "react-native-gesture-handler";


const CARD_WIDTH = Dimensions.get("window").width * 0.8;
const CARD_HEIGHT = Dimensions.get("window").height * 0.4;
const SPACING_FOR_CARD_INSET = Dimensions.get("window").width * 0.1 - 10;
const HomeScreen = () => {
  const [data, setData] = React.useState(datas);
  useEffect(() => {
    datas.push({
      id: new Date().getTime().toString(),
      add: true,
    });
  }, []);



  return (
    <SafeAreaView className="flex mb-[60px]">
      <Text className="mt-4 text-base text-center font-bold">
        Ton equipement
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 10}
        decelerationRate={"fast"}
        snapToAlignment="center"
        contentInset={{
          top: 0,
          left: SPACING_FOR_CARD_INSET,
          bottom: 0,
          right: SPACING_FOR_CARD_INSET,
        }}
        contentContainerStyle={{
          paddingHorizontal:
            Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0,
        }}
      >
        {datas.map((item, index) => (
          <Card
            key={index}
            cardWidth={CARD_WIDTH}
            cardHeight={CARD_HEIGHT}
            add={item.add}
            onClick={() => {}}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "5",
                borderRadius: 15,
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
                  <Text style={styles.smallText}>{"Entretient"}</Text>
                  <Text>7 à faire</Text>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  image: {
    flex: 0.6,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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

export default HomeScreen;
