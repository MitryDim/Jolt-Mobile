// import { Animated, FlatList, StyleSheet, Text, View,Dimensions } from "react-native";
// import React, { useRef, useState } from "react";

// import SlideItem from "./SlideItem";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";

// const Slider = ({ datas }) => {
//   const [index, setIndex] = useState(0);
//   const scrollX = useRef(new Animated.Value(0)).current;

//   const handleOnScroll = (event) => {
//     Animated.event(
//       [
//         {
//           nativeEvent: {
//             contentOffset: {
//               x: scrollX,
//             },
//           },
//         },
//       ],
//       {
//         useNativeDriver: false,
//       }
//     )(event);
//   };

//   const handleOnViewableItemsChanged = useRef(({ viewableItems }) => {
//     setIndex(viewableItems[0].index);
//   }).current;

//   const viewabilityConfig = useRef({
//     waitForInteraction: true,
//     itemVisiblePercentThreshold: 1,
//   }).current;

//   return (
//     datas &&
//     datas.length > 0 && (
//       <Swiper
//         slidesPerView={3}
//         spaceBetween={20}
//         pagination={{
//           clickable: true,
//         }}
//       >
//         {datas.map((card, index) => {
//           <SwiperSlide key={index}>
//             <SlideItem item={card} />
//           </SwiperSlide>;
//         })}
//       </Swiper>
//     )
//   );
// };

// export default Slider;

// const styles = StyleSheet.create({});
