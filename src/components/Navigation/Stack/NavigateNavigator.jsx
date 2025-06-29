import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import IconComponent from "../../Icons";
import MapScreen from "../../../containers/MapScreen";
import { HeaderBackButton } from "@react-navigation/elements";
import AddFavoriteAddressScreen from "../../AddFavoriteAddressScreen";
import FavoriteListScreen from "../../FavoriteListScreen";
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
      <Stack.Screen
        name="FavoriteList"
        component={FavoriteListScreen}
        options={{ title: "Favoris" }}
      />
    </Stack.Navigator>
  );
}

export default NavigateNavigator;
