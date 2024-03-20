import { View, Text } from "react-native";

const TraveledCards = (props) => {


  return (
    <>
      <View className="flex flex-row justify-between items-center w-96 h-24 bg-slate-300 rounded-lg mt-2 mb-2">
        <View className="bg-red-500 flex justify-center items-center mx-10">
          <Text className="text-slate-700 text-lg font-bold">{props.start} - {props.end}</Text>
        </View>
        <View className="bg-yellow-500 flex justify-end items-center mx-2 pr-2">
          <Text className="text-slate-700 text-lg">33 Km</Text>
          <Text className="text-slate-700 text-lg">9 min</Text>
        </View>
      </View>
    </>
  );
};

export default TraveledCards;
