import { View, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import NavigateNavigator from "./Stack/NavigateNavigator";
import HomeNavigator from "./Stack/HomeNavigator";
import SettingsProfileNavigator from "./Stack/SettingsProfileScreen";
import MaintainsNavigator from "./Stack/MaintainsNavigator";
import RouteTraveledNavigator from "./Stack/RouteTraveledNavigator";
import React from "react";
import IconComponent from "../Icons";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Avatar from "../Avatar";
const Tab = createBottomTabNavigator();
const username = "Val";

//Bouton custom pour le navigation 
const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: "center",
      alignItems: "center",
      ...styles.shadow,
    }}
    onPress={onPress}
  >
    <View
      style={{
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#e32f45",
      }}
    >
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

              if (routeName === "") {
                return { display: "none" };
              }
              return tabBarStyle;
            })(route),
            tabBarIcon: ({ focused }) => {
              return (
                <IconComponent
                  library="MaterialCommunityIcons"
                  name="home-analytics"
                  style={{ color: focused ? "#70E575" : "gray" }}
                  size={35}
                />
              );
            },
          })}
        />
        <Tab.Screen
          name="Trajet Effectués"
          component={RouteTraveledNavigator}
          options={{
            tabBarIcon: ({ focused }) => {
              return (
                <IconComponent
                  library="MaterialCommunityIcons"
                  name="map-marker-path"
                  style={{ color: focused ? "dodgerblue" : "gray" }}
                  size={35}
                />
              );
            },
          }}
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
                  style={{ color: focused ? "orange" : "lightblue" }}
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
                  style={{ color: focused ? "dodgerblue" : "lightblue" }}
                  size={35}
                />
              );
            },
           // tabBarBadge: nbMaintainsDone,
            tabBarBadgeStyle: {
              backgroundColor: "red", // Couleur de fond du badge
              color: "white", // Couleur du texte du badge
              fontSize: 12, // Taille de la police
              fontWeight: "bold", // Poids de la police
            //  display: nbMaintainsDone > 0 ? "flex" : "none",
            },
          }}
        />
        <Tab.Screen
          name="Profil"
          component={SettingsProfileNavigator}
          options={{
            tabBarIcon: ({ focused }) => {
              return (
                <>
                  {username ? (
                    <Avatar
                      username={username}
                      style={{
                        width: 35,
                        height: 35,
                        backgroundColor: focused ? "dodgerblue" : "lightblue",
                      }}
                    ></Avatar>
                  ) : (
                    <IconComponent
                      library="MaterialCommunityIcons"
                      name="account-circle-outline"
                      style={{ color: focused ? "dodgerblue" : "lightblue" }}
                      size={35}
                    />
                  )}
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
    borderRadius: 15,
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
