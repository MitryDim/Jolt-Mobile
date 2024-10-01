import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChoiceAddressScreen from "../../../containers/ChoiceAddressScreen";
import ChoiceItineraryScreen from "../../../containers/ChoiceItinineraryScreen";
import { Text, View } from "react-native";
import IconComponent from "../../Icons";
const Stack = createNativeStackNavigator();

function NavigateNavigator() {
  return (
    <Stack.Navigator initialRouteName="ChoiceAddress">
      <Stack.Screen
        name="ChoiceAddress"
        component={ChoiceAddressScreen}
        options={{ navigationBarColor: "#FFFFFF", headerShown: false }}
      />
      <Stack.Screen
        name="ChoiceItinerary"
        component={ChoiceItineraryScreen}
        options={({ route }) => ({
          headerTitle: () => {
            console.log(route.params.data);
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
          headerBackButtonMenuEnabled: false,
          headerBackTitleVisible: false,
          headerTitleAlign: "left",
        })}
      />
      <Stack.Screen
        name="Travel"
        component={ChoiceItineraryScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
    // Navigation
  );
}

export default NavigateNavigator;
