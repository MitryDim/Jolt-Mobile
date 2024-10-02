// ScreenB.js
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import Maps from "../components/Maps";
import * as Location from "expo-location";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
  ScrollView,
} from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { LineChart } from "react-native-chart-kit";
import { Dimensions, PanResponder } from "react-native";
const screenWidth = Dimensions.get("window").width;
import Animated, {
  Easing,
  withSpring,
  withTiming,
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import { getDefaultHeaderHeight } from "@react-navigation/elements";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ripple from "../components/Ripple";
// const CustomHeader = ({ navigation }) => (
//   <View style={{ flexDirection: "row", alignItems: "center" }}>
//     <TouchableOpacity onPress={() => navigation.goBack()}>
//       <Text style={{ marginLeft: 10, fontSize: 16 }}>Retour</Text>
//     </TouchableOpacity>
//   </View>
// );

const ChoiceItinerary = (geoadress) => {
  const { navigate } = useNavigation();
  const scrollViewRef = useRef(null);
  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const headerheight = getDefaultHeaderHeight(frame, false, insets.top);
  const bottomSheetY = useSharedValue(1);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%"], []);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [currentRegion, setCurrentRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
    heading: 0,
  });
  const sheetOffset = useSharedValue(0);

  const [routeOptions, setRouteOptions] = useState(
    geoadress.route?.params?.data?.routeOptions
  );
  const vitesse = 25;
  const [altitudeChartVisible, setAltitudeChartVisible] = useState(
    Array(routeOptions?.length).fill(false)
  );

  const [stopAnimation, setStopAnimation] = useState(false);

  const toggleAltitudeChart = (index) => {
    const updatedAltitudeChartVisible = [...altitudeChartVisible];
    updatedAltitudeChartVisible[index] = !updatedAltitudeChartVisible[index];
    setAltitudeChartVisible(updatedAltitudeChartVisible);
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
    strokeWidth: 1, // Largeur de la ligne du graphique
    verticalLabelRotation: 0,
    decimalPlaces: 1,
    style: {
      borderRadius: 16,
    },
  };

  const RouteOptions = ({
    routeOptions,
    onRouteSelect,
    selectedRouteIndex,
  }) => {
    return (
      <>
        <BottomSheetScrollView
          ref={scrollViewRef}
          onScroll={handleCancelAnimation}
          onLayout={() => {
            let lenght = 0;
            for (i = 0; i < selectedRouteIndex; i++) {
              console.log(altitudeChartVisible[i]);
              if (altitudeChartVisible[i]) {
                lenght += 10 + 108;
              } else {
                lenght += 10;
              }
            }
            if (selectedRouteIndex !== 0)
              if (altitudeChartVisible[selectedRouteIndex]) lenght += 100;

            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({
                y: selectedRouteIndex * lenght,
                animated: true, // Utilisez une animation pour le défilement
              });
            }
          }}
        >
          {routeOptions.map((route, index) => (
            <TouchableOpacity
              style={[
                styles.card,
                index === selectedRouteIndex && styles.selectedCard,
              ]}
              key={index}
              onPress={() => onRouteSelect(index)}
            >
              <Text style={styles.cardTitle}>
                {" "}
                {route.duration}{" "}
                <Text style={styles.cardDistance}>({route.routeDistance})</Text>
              </Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderRadius: 8,
                  borderColor: "gray",
                  padding: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  width: "30%",
                  height: 35,
                }}
                onPress={() => toggleAltitudeChart(index)}
              >
                <MaterialCommunityIcons
                  name="reflect-horizontal"
                  style={{ color: "black", marginLeft: 0 }}
                  size={15}
                >
                  <Text>{" Altitude"} </Text>{" "}
                  <MaterialCommunityIcons
                    name={
                      altitudeChartVisible[index]
                        ? "chevron-up"
                        : "chevron-down"
                    } // Utilisez une icône de flèche vers le bas ou vers la droite en fonction de l'état
                    style={{ color: "black", marginTop: 0 }}
                    size={15}
                  />
                </MaterialCommunityIcons>
              </TouchableOpacity>
              {altitudeChartVisible[index] && (
                <LineChart
                  data={{
                    labels: [], // Vous pouvez ajouter des étiquettes pour l'axe des X si nécessaire
                    datasets: [
                      {
                        data: route.coordinates.map(
                          (coordinate) => coordinate.altitude
                        ),
                        color: (opacity = 1) =>
                          index === selectedRouteIndex ? "blue" : "gray", // Couleur de la ligne du graphique
                      },
                    ],
                  }}
                  withVerticalLines={false}
                  withDots={false}
                  yAxisInterval={15}
                  height={100}
                  width={350}
                  chartConfig={chartConfig}
                  bezier
                  formatYLabel={(label) => {
                    const altitudeData = route.coordinates.map(
                      (coordinate) => coordinate.altitude
                    );
                    const minAltitude = Math.min(...altitudeData.flat());
                    const maxAltitude = Math.max(...altitudeData.flat());
                    const customYLabels = [minAltitude, maxAltitude];
                    return customYLabels.includes(parseFloat(label))
                      ? `${label} m`
                      : "";
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              )}
            </TouchableOpacity>
          ))}
        </BottomSheetScrollView>
      </>
    );
  };

  const getAllRoutes = async () => {
    const curlocation = await Location.getCurrentPositionAsync({});
    console.log("curlocation", curlocation);
    const location = curlocation.coords;
    const heading = curlocation.heading;
    setCurrentRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
      heading: heading,
    });
  };

  useEffect(() => {
    getAllRoutes();
  }, [geoadress.route.params]);

  const handleRouteSelect = (index) => {
    setSelectedRouteIndex(index);
  };

  const handleGoButtonPress = () => {
    try {
      navigate("Travel", routeOptions[selectedRouteIndex]);
    } catch (error) {
      console.error("Une erreur s'est produite lors de la navigation :", error);
    }
  };

  const handleCancelAnimation = () => {
    setStopAnimation(true);
  };

  const mapAnimatedStyle = useAnimatedStyle(() => {
    let value = 0;
    if (bottomSheetY.value === 1) {
      const percentage = snapPoints[0];
      const numericPercentage = parseFloat(percentage.replace("%", ""));
      value =
        (frame.height - headerheight - 42) * ((100 - numericPercentage) / 100);
      bottomSheetY.value = value;
    } else {
      value = bottomSheetY.value;
    }
    return {
      height: value,
    };
  });

  useDerivedValue(() => {
    if (sheetOffset.value != 0)
      bottomSheetY.value =
        frame.height - (frame.height - sheetOffset.value - 8);
  }, [sheetOffset]);

  return (
    <View style={styles.container} onTouchStart={handleCancelAnimation}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Animated.View style={[styles.map, mapAnimatedStyle]}>
            <Maps
              styleMaps={styles.map}
              initialRouteOptions={routeOptions}
              selectedRouteIndex={selectedRouteIndex}
              onPolylineSelect={handleRouteSelect}
              currentRegion={currentRegion}
              userSpeed={null}
              isNavigating={false}
              screenHeightRatio={mapAnimatedStyle.height}
            />
          </Animated.View>

          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            position="bottom"
            contentContainerStyle={styles.bottomSheet}
            animatedPosition={sheetOffset}
          >
            <RouteOptions
              routeOptions={routeOptions}
              onRouteSelect={handleRouteSelect}
              selectedRouteIndex={selectedRouteIndex}
            />
          </BottomSheet>
        </View>

        <View
          style={{
            height: 80,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            borderColor: "#C1C1C1",
            borderTopWidth: 1,
          }}
        >
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Pressable
              style={{
                height: 50,
                width: 150,
                borderColor: "#C1C1C1",
                backgroundColor: "#3498db",
                borderWidth: 1,
                borderRadius: 40,
                marginRight: 0,
                marginBottom: 15,
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => handleGoButtonPress()}
            >
              <Ripple
                style={[styles.ripple]}
                maxWidth={150}
                contentContainerStyle={[styles.containerRipple]}
                stopAnimation={stopAnimation}
                handleFinish={handleGoButtonPress}
              >
                <Text style={{ color: "white" }}>C'est parti !</Text>
              </Ripple>
            </Pressable>
          </View>
        </View>
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8fcbbc",
  },
  map: {
    ...StyleSheet.absoluteFillObject, 
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "transparent", // Couleur du bord gauche non sélectionné
  },
  selectedCard: {
    borderLeftColor: "#3498db", // Couleur du bord gauche sélectionné (bleu clair)
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardDistance: {
    fontWeight: "normal",
    fontSize: 14,
  },
  bottomSheet: {
    backgroundColor: "white",
    zIndex: 2,
  },
  containerRipple: {
    width: 150,
    height: 50,
    backgroundColor: "#3498db",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    // iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    // Android
    elevation: 2,
    overflow: "hidden",
  },
  ripple: {
    backgroundColor: "rgba(0,0,0,0.2)",
    top: 0,
    left: 0,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
});

export default ChoiceItinerary;
