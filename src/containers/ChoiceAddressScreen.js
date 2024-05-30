import { View, Text, StyleSheet } from "react-native";
import React,{useRef} from "react";
import MapView, { Polyline, Marker, AnimatedRegion } from "react-native-maps";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const ChoiceAddressScreen = () => {
   const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  return (
    <View style={{ flex: 1, marginBottom: 60, paddingBottom: insets.bottom }}>
      <View style={{borderRadius:30, backgroundColor:'white'}}></View>
      <MapView
        style={styles.map}
        ref={mapRef}
        showsUserLocation={false}
        followsUserLocation={false}
        zoomEnabled={true}
        zoomControlEnabled={true}
        zoomTapEnabled={true}
        pitchEnabled={true}
      ></MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width:"100%",
    height:'100%',
  },
});

export default ChoiceAddressScreen;
