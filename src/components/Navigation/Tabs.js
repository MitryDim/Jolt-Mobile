import {
  View,
  StyleSheet,
  TouchableOpacity,
  Button,
  Image,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import NavigateNavigator from "./Stack/NavigateNavigator";
import HomeNavigator from "./Stack/HomeNavigator";
import ProfileNavigator from "./Stack/ProfileScreen";
import MaintainsNavigator from "./Stack/MaintainsNavigator";
import RouteTraveledNavigator from "./Stack/RouteTraveledNavigator";
import React from "react";
import IconComponent from "../Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import avatar from "../../../assets/avatar.jpg";
import Avatar from "../Avatar";
import AuthNavigator from "./Stack/AuthNavigator";
const Tab = createBottomTabNavigator();
const username = "Val";
let maintainsItemsNumber = 2; // Nombre de maintenances à effectuer

//Bouton custom pour le navigation
const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity activeOpacity={1} onPress={onPress}>
    <View className="flex w-20 h-20 top-[-40] rounded-full bg-white">
      {children}
    </View>
  </TouchableOpacity>
);

const Tabs = () => {
  const insets = useSafeAreaInsets();

  const tabBarStyle = [
    styles.tabBarStyle,
    {
      bottom: insets.bottom,
    },
  ];

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarStyle: tabBarStyle,
          tabBarItemStyle: {
            height: 70,
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarShowLabel: false,
          navigationBarColor: "#FFFFFF",
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeNavigator}
          options={({ route }) => ({
            navigationBarColor: "#FFFFFF",
            tabBarStyle: ((route) => {
              const routeName = getFocusedRouteNameFromRoute(route) ?? "";
              console.log("routeName", routeName);
            if (routeName === "ChoiceItinerary" || routeName === "Travel") {
              return { display: "none" };
            }
              return tabBarStyle;
            })(route),
            tabBarIcon: ({ focused }) => {
              return (
                <IconComponent
                  library="MaterialCommunityIcons"
                  name="home-analytics"
                  style={{ color: focused ? "#70E575" : "grey" }}
                  size={35}
                />
              );
            },
          })}
        />
        <Tab.Screen
          name="Trajet Effectués"
          component={RouteTraveledNavigator}
          options={({ route }) => ({
            navigationBarColor: "#FFFFFF",
            tabBarStyle: ((route) => {
              const routeName = getFocusedRouteNameFromRoute(route) ?? "";
              console.log(routeName);
              if (routeName === "TrackingDetailsScreen") {
                return { display: "none" };
              }
              return tabBarStyle;
            })(route),
            tabBarIcon: ({ focused }) => {
              return (
                <IconComponent
                  library="MaterialCommunityIcons"
                  name="map-marker-path"
                  style={{ color: focused ? "#70E575" : "grey" }}
                  size={35}
                />
              );
            },
          })}
        />
        <Tab.Screen
          name="Navigate"
          component={NavigateNavigator}
          options={({ route }) => ({
            tabBarStyle: ((route) => {
              const routeName = getFocusedRouteNameFromRoute(route) ?? "";

              if (routeName === "ChoiceItinerary" || routeName === "Travel") {
                return { display: "none" };
              }
              return tabBarStyle;
            })(route),
            tabBarIcon: ({ focused }) => {
              return (
                <IconComponent
                  library="MaterialCommunityIcons"
                  name="human-scooter"
                  className="mr-1"
                  style={{ color: focused ? "#70E575" : "grey" }}
                  size={35}
                />
              );
            },
            tabBarButton: (props) => {
              return <CustomTabBarButton {...props} />;
            },
          })}
        />

        <Tab.Screen
          name="maintains"
          component={MaintainsNavigator}
          options={{
            tabBarIcon: ({ focused }) => {
              return (
                <IconComponent
                  library="MaterialCommunityIcons"
                  name="wrench"
                  style={{ color: focused ? "#70E575" : "grey" }}
                  size={32}
                />
              );
            },
            tabBarBadge:
              maintainsItemsNumber >= 100
                ? "+99"
                : maintainsItemsNumber.toString(),
            tabBarBadgeStyle: {
              backgroundColor: "red",
              borderRadius: 10, // Adjust the border radius for smaller corners
              color: "white",
              fontSize: 10,
              fontWeight: "bold",
              display: maintainsItemsNumber > 0 ? "flex" : "none",
            },
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileNavigator}
          options={{
            tabBarIcon: ({ focused }) => {
              return (
                <>
                  {avatar ? (
                    <View
                      className="bg-white w-12 h-12 rounded-full overflow-hidden"
                      style={{
                        borderColor: focused ? "#70E575" : "white",
                        borderWidth: 2,
                      }}
                    >
                      <Image
                        source={avatar}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </View>
                  ) : username ? (
                    <Avatar
                      username={username}
                      style={{
                        backgroundColor: focused ? "#70E575" : "lightblue",
                      }}
                    ></Avatar>
                  ) : (
                    <IconComponent
                      library="MaterialCommunityIcons"
                      name="account-circle-outline"
                      style={{ color: focused ? "#70E575" : "lightblue" }}
                      size={35}
                    />
                  )}
                </>
              );
            },
          }}
        />

        <Tab.Screen
          name="Auth"
          component={AuthNavigator}
          options={{
            tabBarIcon: ({ focused }) => {
              return (
                <>
                  <IconComponent
                    library="MaterialIcons"
                    name="logo-dev"
                    style={{ color: focused ? "#70E575" : "grey" }}
                    size={35}
                  />
                </>
              );
            },
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Utilisez flex pour occuper tout l'espace vertical disponible
    flexDirection: "row",
    justifyContent: "space-between",
  },
  shadow: {
    shadowColor: "#7F5DF0",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  tabBarStyle: {
    position: "absolute",
    left: 0,
    right: 0,
    elevation: 5,
    backgroundColor: "white",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: 60,
    shadowColor: "#7F5DF0",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});
export default Tabs;
