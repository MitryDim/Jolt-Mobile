import { View, Text } from 'react-native'
import React from 'react'
import TraveledCards from '../components/TraveledCards'

const RouteTraveledScreen = () => {
  let props = "props"

  return (
    <View className="flex justify-center items-center ">
      <Text className="text-3xl font-bold">Route Traveled Screen</Text>
      <TraveledCards props={props}/>
    </View>
  )
}

export default RouteTraveledScreen;