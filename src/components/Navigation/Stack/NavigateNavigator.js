import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChoiceAddressScreen from "../../../containers/ChoiceAddressScreen";
import ChoiceItineraryScreen from "../../../containers/ChoiceItinineraryScreen";
import TravelScreen from "../../../containers/TravelScreen1";
import { Text, View } from "react-native";
import IconComponent from "../../Icons";
import MapScreen from "../../../containers/MapScreen";
const Stack = createNativeStackNavigator();

function NavigateNavigator() {
  return (
    <Stack.Navigator initialRouteName="MapScreen">
      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
          navigationBarColor: "#FFFFFF",
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      {/* <Stack.Screen
        name="ChoiceItinerary"
        component={ChoiceItineraryScreen}
        options={({ route }) => ({
          headerTitle: () => {
            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text>Votre position</Text>
                <IconComponent
                  library={"MaterialCommunityIcons"}
                  icon="arrow-right"
                  size={15}
                  style={{ padding: 0, marginRight: 0 }}
                />
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={{ maxWidth: "60%" }}
                >
                  {route.params.data.title}
                </Text>
              </View>
            );
          },
          headerShown: true,
          unmountOnBlur: true,
          headerBackButtonMenuEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerTitleAlign: "left",
        })}
      />
      <Stack.Screen
        name="Travel"
        component={TravelScreen}
        options={({ route }) => ({
          headerShown: false,
          unmountOnBlur: true,
        })}
      /> */}
    </Stack.Navigator>
    // Navigation
  );
}

export default NavigateNavigator;
