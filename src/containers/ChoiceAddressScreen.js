import { View, Text, StyleSheet } from "react-native";
import React,{useRef,useState,useEffect} from "react";
import MapView, { AnimatedRegion, Animated, Circle,Marker, MapMarker,MarkerAnimated } from "react-native-maps";
import * as Location from 'expo-location';
import Airplane from "../components/Arrow";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
const COLOR = {
  paperBlue100: { color: "#D0E3FA" },
  paperBlue200: { color: "#AFCCF9" },
};
const ChoiceAddressScreen = () => {


  const mapRef = useRef(null);

  const [cameraHeading, setCameraHeading] = React.useState(0);
  function updateCameraHeading() {
    const map = mapRef.current;
    map.getCamera().then((info) => {
      setCameraHeading(info.heading);
    });
  }
   const insets = useSafeAreaInsets();
    const [location, setLocation] = useState({
      accuracy: 0,
      altitude: 0,
      altitudeAccuracy: 0,
      heading: 0,
      latitude: 0,
      longitude: 0,
      speed: 0,
    });
console.log(location)
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          let { coords } = newLocation;
          console.log("newLocation", coords);
          setLocation(coords);
        }
      );
    })();
  }, []);

  return (
    <View style={{ flex: 1, marginBottom: 60, paddingBottom: insets.bottom }}>
      <View style={{ borderRadius: 30, backgroundColor: "white" }}></View>
      <MapView
        style={styles.map}
        ref={mapRef}
        showsUserLocation={true}
        followsUserLocation={true}
        zoomEnabled={true}
        zoomControlEnabled={true}
        zoomTapEnabled={true}
        pitchEnabled={true}
        onTouchEnd={() => {
          updateCameraHeading();
        }}
        onTouchCancel={() => {
          updateCameraHeading();
        }}
        onTouchStart={() => {
          updateCameraHeading();
        }}
        onTouchMove={() => {
          updateCameraHeading();
        }}
      >
        <MarkerAnimated
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
            style={{
              transform: [{ rotate: `${location.heading - cameraHeading}deg` }],
            }}
          >
            <Airplane fill="red" />
          </View>
        </MarkerAnimated>
      </MapView>
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
