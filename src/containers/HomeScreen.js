import { View, Text, StyleSheet } from "react-native";
import React from 'react'
import PagerView from "react-native-pager-view";
import {
  SafeAreaView
} from "react-native-safe-area-context";
import Card from "../components/Cards";
const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, marginBottom: 60 }}>
      <Text
        style={{
          textAlign: "center",
          fontSize: 16,
          fontWeight: "bold",
          marginTop: "8%",
        }}
      >
        Ton equipement
      </Text>
      <PagerView style={styles.viewPager} initialPage={0}>
        <View style={styles.page} key="1">
          <Card
            title={"Halo"}
            description={"test"}
            image={
              "https://m.media-amazon.com/images/I/51o3dQgxytL.__AC_SX300_SY300_QL70_ML2_.jpg"
            }
          />
        </View>
        <View style={styles.page} key="2">
          <Card
            title={"Halo"}
            description={"test"}
            image={
              "https://m.media-amazon.com/images/I/51o3dQgxytL.__AC_SX300_SY300_QL70_ML2_.jpg"
            }
          />
        </View>
      </PagerView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewPager: {
    width: "100%",
    height: "25%",
    marginTop: '3%',
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

export default HomeScreen