import React, { useRef, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import Ripple from "../../Ripple";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
  strokeWidth: 1,
  verticalLabelRotation: 0,
  decimalPlaces: 1,
  style: { borderRadius: 16 },
};

const RouteOptions = ({
  routeOptions,
  onRouteSelect,
  selectedRouteIndex,
  altitudeChartVisible,
  toggleAltitudeChart,
}) => (
  // Taille du Footer mb-[50px]
  <BottomSheetScrollView className={"mb-[80px]"}>
    {routeOptions.map((route, index) => (
      <TouchableOpacity
        style={[
          styles.card,
          index === selectedRouteIndex && styles.selectedCard,
        ]}
        key={index}
        onPress={() => onRouteSelect(index)}
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle}>
          {route.duration}{" "}
          <Text style={styles.cardDistance}>({route.routeDistance})</Text>
        </Text>
        <TouchableOpacity
          style={styles.altitudeBtn}
          onPress={() => toggleAltitudeChart(index)}
        >
          <MaterialCommunityIcons
            name="reflect-horizontal"
            style={{ color: "black", marginLeft: 0 }}
            size={15}
          >
            <Text>{" Altitude"} </Text>
            <MaterialCommunityIcons
              name={altitudeChartVisible[index] ? "chevron-up" : "chevron-down"}
              style={{ color: "black", marginTop: 0 }}
              size={15}
            />
          </MaterialCommunityIcons>
        </TouchableOpacity>
        {altitudeChartVisible[index] && (
          <LineChart
            pointerEvents="none"
            data={{
              labels: [],
              datasets: [
                {
                  data: route.coordinates.map(
                    (coordinate) => coordinate.altitude
                  ),
                  color: (opacity = 1) =>
                    index === selectedRouteIndex ? "blue" : "gray",
                },
              ],
            }}
            withVerticalLines={false}
            withDots={false}
            yAxisInterval={15}
            height={100}
            width={screenWidth - 40}
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
);

const renderFooter = (footerProps) => {
  const { stopAnimation, handleGoButtonPress } = footerProps;

  return (
    <BottomSheetFooter {...footerProps} bottomInset={0}>
      <View style={styles.footerLine} />
      <View style={styles.footerContainer}>
        {/* Ligne en haut */}

        {/* Bouton centré */}
        <TouchableOpacity
          style={styles.goButton}
          onPress={() => {
            // Action à faire quand on clique sur "Y aller"
          }}
          activeOpacity={0.8}
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
            onPress={handleGoButtonPress}
          >
            <Ripple
              style={[styles.ripple]}
              maxWidth={150}
              contentContainerStyle={[styles.containerRipple]}
              stopAnimation={stopAnimation}
              handleFinish={() => {
                if (handleGoButtonPress) handleGoButtonPress();
              }}
            >
              <Text style={{ color: "white" }}>C'est parti !</Text>
            </Ripple>
          </Pressable>
        </TouchableOpacity>
      </View>
    </BottomSheetFooter>
  );
};

const ItineraryBottomSheet = ({
  routes,
  selectedRouteIndex,
  onRouteSelect,
  bottomSheetRef,
  snapPoints = ["25%", "50%"],
  handleGoButtonPress,
  onChange = () => {},
}) => {
  const [stopAnimation, setStopAnimation] = useState(false);
  const scrollViewRef = useRef(null);
  const [altitudeChartVisible, setAltitudeChartVisible] = useState(
    Array(routes?.length).fill(false)
  );

  const toggleAltitudeChart = (index) => {
    const updated = [...altitudeChartVisible];
    updated[index] = !updated[index];
    setAltitudeChartVisible(updated);
  };

  if (!routes?.length) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      style={styles.bottomSheet}
      footerComponent={(footerProps) =>
        renderFooter({ ...footerProps, stopAnimation, handleGoButtonPress })
      }
      onChange={onChange}
      onAnimate={(fromIndex, toIndex) => {
        if (toIndex == 2) {
          setStopAnimation(true);
        }
      }}
    >
      <RouteOptions
        routeOptions={routes}
        onRouteSelect={(index) => {
          onRouteSelect(index);
          setStopAnimation(true);
        }}
        selectedRouteIndex={selectedRouteIndex}
        altitudeChartVisible={altitudeChartVisible}
        toggleAltitudeChart={toggleAltitudeChart}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: "white",
    zIndex: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  selectedCard: {
    borderLeftColor: "#3498db",
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
  altitudeBtn: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "gray",
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
    height: 35,
    marginTop: 8,
    marginBottom: 4,
  },
  footerContainer: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  footerLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  goButton: {
    backgroundColor: "#3498db",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  goButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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

export default ItineraryBottomSheet;
