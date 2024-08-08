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
import scooters from "../Data/myScooters";
import Card from "../components/Cards";
import Separator from "../components/Separator";

const CARD_WIDTH = Dimensions.get("window").width * 0.7;
const CARD_HEIGHT = Dimensions.get("window").height * 0.35;
const SPACING_FOR_CARD_INSET = Dimensions.get("window").width * 0.5 - 10;

const HomeScreen = () => {
  useEffect(() => {
    scooters.push({
      id: new Date().getTime().toString(),
      add: true,
    });
  }, []);

  return (
    <SafeAreaView className="flex mb-[60px]">
      <Text className="mt-4 text-xl text-center font-bold">Ton equipement</Text>
      <Separator />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + (Platform.OS === "android" ? 10 : 10)}
        decelerationRate={"fast"}
        snapToAlignment="center"
        pagingEnabled={true}
        contentInset={{
          top: 0,
          left: SPACING_FOR_CARD_INSET,
          bottom: 0,
          right: SPACING_FOR_CARD_INSET,
        }}
      >
        {scooters.map((item, index) => (
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
                style={[styles.image, { backgroundColor: "transparent" }]}
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
                  <Text style={styles.smallText} className="font-semibold">Compteur</Text>
                  <Text>{item.counter}</Text>
                </View>
                <View style={styles.column}>
                  <Text style={styles.smallText} className="font-semibold">Entretient</Text>
                  <Text>{item.maintains}</Text>
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
  image: {
    flex: 0.6,
    width: "100%",
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
