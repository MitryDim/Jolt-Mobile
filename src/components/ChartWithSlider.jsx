import React, { useState, useRef } from "react";
import { View, Text, Dimensions, PanResponder } from "react-native";
import { LineChart } from "react-native-svg-charts-updated-peers";
import * as shape from "d3-shape";
import { Path, Circle, G, Rect, Text as SVGText } from "react-native-svg";
import * as d3 from "d3-shape";
import Slider from "@react-native-community/slider";

const ChartWithSlider = ({ data, label, color, unit }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  // Fonction pour générer un path pour une partie des données
  const getPartialPath = (
    dataArray,
    from,
    to,
    yAccessor,
    xScale,
    yScale,
    area = false
  ) => {
    const slice = dataArray.slice(from, to);

    if (area) {
      const areaGenerator = d3
        .area()
        .x((_, i) => xScale(i + from))
        .y0(yScale(0)) // base de la zone
        .y1((d) => yScale(d))
        .curve(d3.curveMonotoneX);

      return areaGenerator(slice);
    } else {
      const lineGenerator = d3
        .line()
        .x((_, i) => xScale(i + from))
        .y((d) => yScale(d))
        .curve(d3.curveMonotoneX);

      return lineGenerator(slice);
    }
  };

  // Custom rendering
  const CustomLinesAndArea = ({ x, y, data }) => {
    const beforePath = getPartialPath(data, 0, selectedIndex + 1, null, x, y);
    const afterPath = getPartialPath(
      data,
      selectedIndex,
      data.length,
      null,
      x,
      y
    );
    const areaPath = getPartialPath(
      data,
      0,
      selectedIndex + 1,
      null,
      x,
      y,
      true
    );

    return (
      <G>
        <Path d={areaPath} fill={color + "33"} />
        <Path d={beforePath} stroke={color} strokeWidth={3} fill="none" />
        <Path d={afterPath} stroke="#cbd5e1" strokeWidth={3} fill="none" />
      </G>
    );
  };

  const CustomDot = ({ x, y, data }) => (
    <Circle
      cx={x(selectedIndex)}
      cy={y(data[selectedIndex])}
      r={7}
      stroke={color}
      strokeWidth={3}
      fill="#fff"
    />
  );
  const chartWidth = screenWidth - 48;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const relativeX = Math.min(
          Math.max(0, gestureState.moveX - 24),
          chartWidth
        );
        const index = Math.round((relativeX / chartWidth) * (data.length - 1));
        setSelectedIndex(index);
      },
    })
  ).current;

  const CustomTooltip = ({ x, y, data }) => {
    const tooltipWidth = 90; // largeur du fond du tooltip doit correspondre à  <Path>
    const tooltipHeight = 40;
    const yPos = y(data[selectedIndex]);
    const xPos = x(selectedIndex);

    // Décalage horizontal pour éviter de sortir du graph
    let dx = 0;
    if (xPos - tooltipWidth / 2 < 0) {
      dx = -(xPos - tooltipWidth / 2); // décale à droite
    } else if (xPos + tooltipWidth / 2 > screenWidth - 48) {
      dx = screenWidth - 48 - (xPos + tooltipWidth / 2); // décale à gauche
    }

    const showBelow = yPos - tooltipHeight < 0;

    return (
      <G x={xPos + dx} y={showBelow ? yPos + 30 : yPos - 30}>
        <Path
          d="M-35,-25 h90 a5,5 0 0 1 5,5 v20 a5,5 0 0 1 -5,5 h-90 a5,5 0 0 1 -5,-5 v-20 a5,5 0 0 1 5,-5 z"
          fill="#e2e8f0"
          stroke="#94a3b8"
        />
        <SVGText
          y={-5}
          x={-5}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#1e293b"
        >
          {data[selectedIndex].toFixed(1)} {unit}
        </SVGText>
      </G>
    );
  };

  return (
    <View
      style={{ margin: 10, backgroundColor: "#fff" }}
      {...panResponder.panHandlers}
    >
      <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>
         {label}
      </Text>
      <LineChart
        style={{ height: 200, width: screenWidth - 48 }}
        data={data}
        contentInset={{ top: 20, bottom: 20 }}
        svg={{ stroke: "transparent" }} // courbe de base masquée
        curve={shape.curveMonotoneX}
      >
        <CustomLinesAndArea />
        <CustomDot />
        <CustomTooltip />
      </LineChart>

      <Text style={{ marginTop: 12, textAlign: "center", fontSize: 16 }}>
        <Text style={{ fontWeight: "bold", color: color }}>
          {data[selectedIndex]?.toFixed(1)} {unit}
        </Text>
      </Text>

      <Slider
        style={{ width: screenWidth - 48, marginTop: 8 }}
        minimumValue={0}
        maximumValue={data.length - 1}
        step={1}
        value={selectedIndex}
        minimumTrackTintColor={color}
        maximumTrackTintColor="#e5e7eb"
        thumbTintColor={color}
        onValueChange={setSelectedIndex}
      />
    </View>
  );
};

export default ChartWithSlider;
