import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChoiceAddressScreen from "../../../containers/ChoiceAddressScreen";
import ChoiceItineraryScreen from "../../../containers/ChoiceItinineraryScreen";
import TravelScreen from "../../../containers/TravelScreen1";
import { Text, View } from "react-native";
import IconComponent from "../../Icons";
import MapScreen from "../../../containers/MapScreen";
import { HeaderBackButton } from "@react-navigation/elements";
import AddFavoriteAddressScreen from "../../AddFavoriteAddressScreen";
const Stack = createNativeStackNavigator();

function NavigateNavigator() {
  return (
    <Stack.Navigator initialRouteName="MapScreen">
      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={({ route, navigation }) => ({
          tabBarStyle: () => {
            const mode = route.params?.mode || "address";
            return {
              display: mode === "itinerary" ? "none" : "flex",
            };
          },
          headerLeft: () => (
            <HeaderBackButton
              title="retour"
              onPress={() => {
                navigation.navigate("MapScreen", {
                  key: String(Date.now()),
                  mode: "address",
                });
              }}
            />
          ),
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Votre position</Text>
              <IconComponent
                library={"MaterialCommunityIcons"}
                icon="arrow-right"
                size={18}
                style={{ marginHorizontal: 8, color: "#3498db" }}
              />
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={{
                  maxWidth: "60%",
                  fontWeight: "bold",
                  color: "#3498db",
                }}
              >
                {route.params?.fromAddress || "Destination"}
              </Text>
            </View>
          ),
          headerShown: route.params?.mode === "itinerary",
          unmountOnBlur: true,
          headerBackButtonMenuEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerTitleAlign: "center",
        })}
      />
      <Stack.Screen
        name="AddFavoriteAddress"
        component={AddFavoriteAddressScreen}
        options={{ title: "Nouvelle adresse" }}
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
