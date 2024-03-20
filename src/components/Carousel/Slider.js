import { Animated, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";

import SlideItem from "./SlideItem";
import Pagination from "./Pagination";

const Slider = ({ datas }) => {
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleOnScroll = (event) => {
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              x: scrollX,
            },
          },
        },
      ],
      {
        useNativeDriver: false,
      }
    )(event);
  };

  const handleOnViewableItemsChanged = useRef(({ viewableItems }) => {
    // console.log('viewableItems', viewableItems);
    setIndex(viewableItems[0].index);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 0,
  }).current;

  return (
    datas &&
    datas.length > 0 && (
      <View
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <FlatList
          style={{ width: "100%", height: "100%" }}
          data={datas}
          renderItem={({ item }) => <SlideItem item={item} />}
          horizontal
          pagingEnabled={true}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          onScroll={handleOnScroll}
          onViewableItemsChanged={handleOnViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        <Pagination data={datas} scrollX={scrollX} index={index} />
      </View>
    )
  );
};

export default Slider;

const styles = StyleSheet.create({});
