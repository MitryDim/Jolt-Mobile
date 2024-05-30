import { View, Text } from 'react-native'
import React from 'react'
import TraveledCards from '../components/RouteTraveled/TraveledCards'

const RouteTraveledScreen = () => {
  const props = {
    start: 'Start',
    end: 'End',
  }


  return (
    <View className="flex justify-center items-center ">
      <Text className="text-3xl font-bold">Route Traveled Screen</Text>
      <TraveledCards props={props}/>
    </View>
  )
}

export default RouteTraveledScreen;