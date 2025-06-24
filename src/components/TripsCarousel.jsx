import React, { useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import TraveledCards from "./RouteTraveled/TraveledCards";
import { FlatList } from "react-native-gesture-handler";

const CARD_WIDTH = Dimensions.get("window").width * 0.7;
const CARD_HEIGHT = 250;
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

  return (
    <FlatList
      data={trips}
      keyExtractor={(item, index) => item._id?.toString() || index.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + 2 * SPACING_FOR_CARD_INSET}
      decelerationRate="fast"
      contentContainerStyle={{ height: CARD_HEIGHT }}
      renderItem={({ item }) => (
        <View
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
            swipeable={false} // désactive le swipe pour éviter les conflits
          />
        </View>
      )}
    />
  );
};

export default CommunityTripsCarousel;
