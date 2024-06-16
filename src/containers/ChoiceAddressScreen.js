import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  TextInput,
  Keyboard,
  Button,
} from "react-native";
import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import MapView, {
  AnimatedRegion,
  Circle,
  Marker,
  MapMarker,
  MarkerAnimated,
  Polyline,
} from "react-native-maps";
import * as Location from "expo-location";
import Arrow from "../components/Arrow";
import { AnimatedMapView } from "react-native-maps/lib/MapView";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetFlatList,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import IconComponent from "../components/Icons";
import ActivityIndicator from "../components/ActivityIndicator";
const COLOR = {
  paperBlue100: { color: "#D0E3FA" },
  paperBlue200: { color: "#AFCCF9" },
};
const ChoiceAddressScreen = () => {
  //TODO: MOVE TO .ENV
  const apiKey = "5b3ce3597851110001cf624862b0fa8bd3c04b8bbf8de461d61c4193";
  const openRouteServiceURL = "https://api.openrouteservice.org";

  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["10%", "25%", "95%"]);
  const heading = new Animated.Value(0);
  const [route, setRoute] = useState([]);
  const coordinates = new AnimatedRegion({
    latitude: 0,
    longitude: 0,
  });
  const [endAdress, setEndAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { width, height } = Dimensions.get("window");
  const [timeoutId, setTimeoutId] = useState(null);
  const insets = useSafeAreaInsets();

  const MERCATOR_OFFSET = Math.pow(2, 28);
  const MERCATOR_RADIUS = MERCATOR_OFFSET / Math.PI;
  const [loading, setLoading] = useState(false);

  const handleItemPress = async (selectedItem) => {
    try {
      updateState({ isLoading: true });
      const Coords = [
        selectedItem.geometry.coordinates[0],
        selectedItem.geometry.coordinates[1],
      ];

      const routeOptions = await getAllRoutes(Coords);
      const data = {
        routeOptions: routeOptions,
        title: `${selectedItem.properties.label}`,
        localisation: { curLoc: curLoc, heading: heading },
      };
      setEndAddress("");
      setSuggestions([]);
      bottomSheetRef.current?.collapse();
      // navigate("ChoiceItinerary", { data });

      //setGeoEndAdress([longitude, latitude]);

      //handleValidation()
    } catch (error) {
      updateState({ isLoading: false });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const renderItemAdresseSuggest = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        style={styles.item}
      >
        <Text>{item.properties.label}</Text>
      </TouchableOpacity>
    );
  };

  const clearSearch = () => {
    setEndAddress("");
    setSuggestions(null);
  };

  const handleEndAddressChange = (text) => {
    setEndAddress(text);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Définissez un nouveau délai
    const newTimeoutId = setTimeout(() => {
      // Effectuez ici l'action que vous souhaitez exécuter lorsque l'utilisateur a fini d'écrire.
      fetchSuggestions(text);
    }, 500); // Vous pouvez ajuster le délai en millisecondes selon vos besoins.

    // Enregistrez le nouvel ID de délai
    setTimeoutId(newTimeoutId);
  };

  const handleSheetChange = useCallback((index) => {
    if (snapPoints[index] != "95%") {
      Keyboard.dismiss();
    }
  }, []);

  const fetchSuggestions = async (input) => {
    //const apiUrl = `https://api.openrouteservice.org/geocode/autocomplete?text=${input}&api_key=${apiKey}`;
    if (input) {
      setLoading(true);
      const apiUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        input
      )}&autocomplete=1&limit=5`;

      try {
        const response = await fetch(apiUrl, { method: "GET" });

        if (!response.ok) {
          setLoading(false);
          return;
        }
        const responseJson = await response.json();

        setSuggestions(responseJson.features);
      } catch (error) {
        console.error(error);
        setSuggestions(null);
      }
      setLoading(false);
    } else {
      setSuggestions(null);
    }
  };

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
          distanceInterval: 2,
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
      // fetchRoutes().then((routeData) => {
      //   const { features } = routeData;
      //   const route = features[0].geometry.coordinates.map((coords) => ({
      //     latitude: coords[1],
      //     longitude: coords[0],
      //   }));

      //   setRoute(route);
      // });
    })();
  }, []);

  // useEffect(() => {
  //   //TODO: Move to another useEffect

  //   fetchRoutes().then((routeData) => {
  //     const { features } = routeData;
  //     const route = features[0].geometry.coordinates.map((coords) => ({
  //       latitude: coords[1],
  //       longitude: coords[0],
  //     }));

  //     setRoute(route);
  //   });
  // }, []);

  //TODO : Move to another file
  const fetchRoutes = async () => {
    const startCoords = [-0.35245299, 49.18524484];
    const endCoords = [-0.35354733, 49.1841649];

    try {
      const response = await fetch(
        `${openRouteServiceURL}/v2/directions/cycling-regular/geojson`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            coordinates: [startCoords, endCoords],
            extra_info: [
              "green",
              "traildifficulty",
              "waytype",
              "waycategory",
              "surface",
              "steepness",
            ],
            geometry_simplify: "false",
            instructions: "true",
            instructions_format: "html",
            language: "fr-fr",
            maneuvers: "true",
            preference: "recommended",
            alternative_routes: { target_count: 2 },
            attributes: ["avgspeed", "percentage"],
            roundabout_exits: "true",
            elevation: "true",
          }),
        }
      );

      const data = await response.json();

      const routeData = data;

      return routeData;
    } catch (error) {
      console.error("Erreur de calcul d'itinéraire :", error);
    }
  };

  const SCREEN_HEIGHT_RATIO = height / 1920; // 1920 est un exemple de hauteur d'écran de référence
  const BASE_OFFSET = -0.005 * SCREEN_HEIGHT_RATIO; // Ajuster 0.002 si nécessaire

  const getOffset = (zoom, heading) => {
    const offset = BASE_OFFSET / Math.pow(2, zoom); // Ajustement basé sur le zoom
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

    if (map !== null && map !== undefined) {
      map?.animateCamera(
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
        const cam = await map?.getCamera();
        Animated.timing(heading, {
          toValue: coordinates.heading - cam?.center ? cam?.center?.heading : 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 500);
    }
  }, []);

  return (
    <View style={{ flex: 1, marginBottom: 60, paddingBottom: insets.bottom }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Polyline coordinates={route} strokeWidth={5} strokeColor="red" />
        </AnimatedMapView>
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          position="bottom"
          onChange={handleSheetChange}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View className="flex-row items-center justify-between border border-gray-300 rounded-full px-2.5 w-96 ">
              <IconComponent icon="search" library="MaterialIcons" size={20} />
              <TextInput
                onFocus={() => bottomSheetRef.current.expand()}
                className="w-full h-12 flex-1"
                placeholder="Entrez une adresse"
                value={endAdress}
                onChangeText={handleEndAddressChange}
                onPress={() => bottomSheetRef.current.expand()}
              />
              {loading && (
                <ActivityIndicator
                  size={20}
                  testID="activity-indicator"
                ></ActivityIndicator>
              )}
              {!loading && endAdress.length > 0 && (
                <IconComponent
                  icon="close"
                  library="MaterialIcons"
                  size={20}
                  onPress={clearSearch}
                  className="cursor-pointer hover:bg-white"
                />
              )}
            </View>
          </View>
          <BottomSheetFlatList
            data={suggestions}
            renderItem={renderItemAdresseSuggest}
            keyExtractor={(item) => item.properties.id}
            ListEmptyComponent={() => {
              return (
                !loading &&
                endAdress.length > 1 && (
                  <Text className="text-center mt-2">Aucun resultat</Text>
                )
              );
            }}
          />
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  item: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default ChoiceAddressScreen;
