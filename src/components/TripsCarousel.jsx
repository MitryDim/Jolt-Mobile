import React, { useRef, useState } from "react";
import { ScrollView, View, Dimensions } from "react-native";
import TraveledCards from "./RouteTraveled/TraveledCards";

const CARD_WIDTH = Dimensions.get("window").width * 0.9;
const CARD_HEIGHT = Dimensions.get("window").height * 0.3;
const SPACING_FOR_CARD_INSET = 5;

const CommunityTripsCarousel = ({
  trips,
  onCardPress,
  onMomentumScrollEnd,
  styles,
  navigation,
}) => {
  const scrollRef = useRef(null);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(
      offsetX / (CARD_WIDTH + 2 * SPACING_FOR_CARD_INSET)
    );
    setCurrentScrollIndex(index);
  };

  if (trips.length === 1) {
    return (
      <View
        style={{
          height: CARD_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TraveledCards
          data={trips[0]}
          navigation={navigation}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          swipeable={false}
          index={0}
        />
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      nestedScrollEnabled={true}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + 2 * SPACING_FOR_CARD_INSET}
      decelerationRate="fast"
      snapToAlignment="center"
      pagingEnabled={true}
      contentContainerStyle={{
        height: CARD_HEIGHT,
        alignItems: "center",
      }}
      style={{ marginHorizontal: SPACING_FOR_CARD_INSET }}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {trips.map((item, index) => (
        <View
          key={item._id?.toString() || index.toString()}
          style={{
            width: CARD_WIDTH,
            marginHorizontal: SPACING_FOR_CARD_INSET,
          }}
        >
          <TraveledCards
            data={item}
            navigation={navigation}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            swipeable={false}
            index={index}
          />
        </View>
      ))}
    </ScrollView>
  );
};

export default CommunityTripsCarousel;
