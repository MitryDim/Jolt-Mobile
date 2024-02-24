import { View, Text, StyleSheet } from "react-native";
import React from 'react'
import {
  SafeAreaView
} from "react-native-safe-area-context";
const HomeScreen = () => {
  return (
    <SafeAreaView  >
    <View style={{backgroundColor:'red'}}>

      <Text>HomeScreen</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
}); 

export default HomeScreen