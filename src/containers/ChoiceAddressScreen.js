import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import MapView, {
  AnimatedRegion,
  Circle,
  Marker,
  MapMarker,
  MarkerAnimated,
} from "react-native-maps";
import * as Location from "expo-location";
import Arrow from "../components/Arrow";
import { AnimatedMapView } from "react-native-maps/lib/MapView";
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
  const heading = new Animated.Value(0);
  const coordinates = new AnimatedRegion({
    latitude: 0,
    longitude: 0,
  });

  const { width, height } = Dimensions.get("window");

  const insets = useSafeAreaInsets();

  const MERCATOR_OFFSET = Math.pow(2, 28);
  const MERCATOR_RADIUS = MERCATOR_OFFSET / Math.PI;

  function mercatorLatitudeToY(latitude) {
    return Math.round(
      MERCATOR_OFFSET -
        (MERCATOR_RADIUS *
          Math.log(
            (1 + Math.sin(latitude * (Math.PI / 180))) /
              (1 - Math.sin(latitude * (Math.PI / 180)))
          )) /
          2
    );
  }

  function mercatorLongitudeToX(longitude) {
    return Math.round(
      MERCATOR_OFFSET + (MERCATOR_RADIUS * longitude * Math.PI) / 180
    );
  }

  function mercatorXToLongitude(x) {
    return (((x - MERCATOR_OFFSET) / MERCATOR_RADIUS) * 180) / Math.PI;
  }

  function mercatorYToLatitude(y) {
    return (
      ((Math.PI / 2 -
        2 * Math.atan(Math.exp((y - MERCATOR_OFFSET) / MERCATOR_RADIUS))) *
        180) /
      Math.PI
    );
  }

  function mercatorAdjustLatitudeByOffsetAndZoom(latitude, offset, zoom) {
    return mercatorYToLatitude(
      mercatorLatitudeToY(latitude) + (offset << (21 - zoom))
    );
  }

  function mercatorAdjustLongitudeByOffsetAndZoom(longitude, offset, zoom) {
    return mercatorXToLongitude(
      mercatorLongitudeToX(longitude) + (offset << (21 - zoom))
    );
  }

  function mercatorDegreeDeltas(latitude, longitude, width, height, zoom) {
    if (!zoom) {
      zoom = 20;
    }

    const deltaX = width / 2;
    const deltaY = height / 4;

    const northLatitude = mercatorAdjustLatitudeByOffsetAndZoom(
      latitude,
      deltaY * -1,
      zoom
    );
    const westLongitude = mercatorAdjustLongitudeByOffsetAndZoom(
      longitude,
      deltaX * -1,
      zoom
    );
    const southLatitude = mercatorAdjustLatitudeByOffsetAndZoom(
      latitude,
      deltaY,
      zoom
    );
    const eastLongitude = mercatorAdjustLongitudeByOffsetAndZoom(
      longitude,
      deltaY,
      zoom
    );

    const latitudeDelta = Math.abs(northLatitude - southLatitude);
    const longitudeDelta = Math.abs(eastLongitude - westLongitude);

    return { latitudeDelta, longitudeDelta };
  }

  useLayoutEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 200,
          distanceInterval: 0.1,
        },
        (newLocation) => {
          let { coords } = newLocation;

          const map = mapRef.current;
          coordinates
            .timing({
              latitude: coords.latitude,
              longitude: coords.longitude,
            })
            .start();

          updateCamera(map, coords, heading);
        }
      );
    })();
  }, []);

  const SCREEN_HEIGHT_RATIO = height / 1920; // 1920 est un exemple de hauteur d'écran de référence
  const BASE_OFFSET = -0.005 * SCREEN_HEIGHT_RATIO; // Ajuster 0.002 si nécessaire

  const getOffset = (zoom, heading) => {
    const offset = BASE_OFFSET / Math.pow(2, zoom ); // Ajustement basé sur le zoom
    const radHeading = heading * (Math.PI / 180); // Convertir le heading en radians

    // Calculer le décalage basé sur le heading
    const offsetLatitude = offset * Math.cos(radHeading);
    const offsetLongitude = offset * Math.sin(radHeading);

    // Inverser le décalage pour le garder en bas de l'écran
    return {
      offsetLatitude: -offsetLatitude,
      offsetLongitude: -offsetLongitude,
    };
  };

  const updateCamera = useCallback((map, coordinates, heading) => {
    const { latitudeDelta, longitudeDelta } = mercatorDegreeDeltas(
      coordinates.latitude,
      coordinates.longitude,
      width,
      height,
      Platform.OS === "ios" ? 20 : 19
    );
    const { offsetLatitude, offsetLongitude } = getOffset(
      Platform.OS === "ios" ? 3 : 2,
      coordinates.heading
    );
    console.log("Platform.OS", Platform.OS);
    map.animateCamera(
      {
        center: {
          latitude: coordinates.latitude + offsetLatitude,
          longitude: coordinates.longitude + offsetLongitude,
        },
        heading: coordinates.heading,
        pitch: Platform.OS === "ios" ? 60 : 75,
        altitude: Platform.OS === "ios" ? 90 : 70,
        zoom: Platform.OS === "ios" ? 0 : 19,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta,
      },
      { duration: 500 }
    );

    setTimeout(async () => {
      const cam = await map.getCamera();
      Animated.timing(heading, {
        toValue: coordinates.heading - cam?.center ? cam?.center?.heading : 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 2000);
  }, []);

  return (
    <View style={{ flex: 1, marginBottom: 60, paddingBottom: insets.bottom }}>
      <View style={{ borderRadius: 30, backgroundColor: "white" }}></View>
      <AnimatedMapView
        style={styles.map}
        ref={mapRef}
        showsUserLocation={false}
        followsUserLocation={false}
        zoomEnabled={true}
        zoomControlEnabled={true}
        zoomTapEnabled={false}
        pitchEnabled={true}
        showsBuildings={true}
      >
        <MarkerAnimated
          coordinate={coordinates}
          flat={false}
          anchor={{ x: 0.5, y: 0.2 }}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: heading.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          >
            <Arrow />
          </Animated.View>
        </MarkerAnimated>
      </AnimatedMapView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});

export default ChoiceAddressScreen;
