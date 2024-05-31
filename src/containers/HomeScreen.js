import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import datas from "../Data/index";

datas.push({
  id: new Date().getTime().toString(),
  add: true,
});

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex mb-[60px]">
      <Text className="mt-4 text-base text-center font-bold">
        Ton equipement
      </Text>
      <View style={styles.viewPager}>{/* <Slider datas={datas} /> */}</View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  viewPager: {
    height: "35%",
    marginTop: "3%",
  },
  page: {
    marginLeft: 30,
    marginRight: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
});

export default HomeScreen;
