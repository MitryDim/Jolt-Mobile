import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import Card from "./Cards";
import { useNavigation } from "@react-navigation/native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

const Maintains = () => {
  const navigation = useNavigation();
  return (
    <View>
      <Text style={{ textAlign: "center" }}>Entretiens à faire</Text>
      <ScrollView
        horizontal
        style={{ height: 125, marginTop: 20 }}
        showsHorizontalScrollIndicator={false}
      >
        <Card
          cardWidth={150}
          cardHeight={"95%"}
          add={false}
          onClick={() => navigation.navigate("Maintains")}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                top: 6,
                textAlign: "center",
              }}
            >
              {"Freins"}
            </Text>
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AnimatedCircularProgress
                size={70}
                width={8}
                backgroundWidth={3}
                fill={6}
                tintColor="#ff0000"
                tintColorSecondary="#00ff00"
                backgroundColor="#3d5875"
                lineCap="round"
                duration={50}
              >
                {(fill) => <Text>{fill} %</Text>}
              </AnimatedCircularProgress>
            </View>
          </View>
        </Card>
      </ScrollView>
      <View>
        <Text>Entretient à venir </Text>
      </View>
    </View>
  );
};

export default Maintains;
