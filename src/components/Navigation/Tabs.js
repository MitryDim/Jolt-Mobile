import {
  View,
  StyleSheet,
  TouchableOpacity,
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import NavigateNavigator from "./Stack/NavigateNavigator";
import HomeNavigator from "./Stack/HomeNavigator";
import ProfileNavigator from "./Stack/ProfileScreen";
import MaintainsNavigator from "./Stack/MaintainsNavigator";
import RouteTraveledNavigator from "./Stack/RouteTraveledNavigator";
import React, { useEffect, useState } from "react";
import IconComponent from "../Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import avatar from "../../../assets/avatar.jpg";
import Avatar from "../Avatar";
import AuthNavigator from "./Stack/AuthNavigator";
import { UserContext } from "../../context/AuthContext";
import { MaintainContext } from "../../context/MaintainContext";
const Tab = createBottomTabNavigator();
const username = "Val";
 
//Bouton custom pour le navigation
const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity activeOpacity={1} onPress={onPress}>
    <View className="flex w-20 h-20 top-[-40] rounded-full bg-white justify-center items-center">
      {children}
    </View>
  </TouchableOpacity>
);

const Tabs = () => {
  const { user } = useContext(UserContext);
  const { pendingCount } = useContext(MaintainContext);
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const tabBarStyle = [
    styles.tabBarStyle,
    {
      bottom: insets.bottom,
      display: isKeyboardVisible && Platform.OS === "android" ? "none" : "flex",
    },
  ];

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarStyle: tabBarStyle,
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
            tabBarIcon: ({ focused, size }) => {
              return (
                <View className="w-full h-full justify-center flex ">
                  <IconComponent
                    library="MaterialCommunityIcons"
                    name="home-analytics"
                    style={{ color: focused ? "#70E575" : "grey" }}
                    size={size}
                  />
                </View>
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
              if (routeName === "TrackingDetailsScreen") {
                return { display: "none" };
              }
              return tabBarStyle;
            })(route),
            tabBarIcon: ({ focused, size }) => {
              return (
                <IconComponent
                  library="MaterialCommunityIcons"
                  name="map-marker-path"
                  style={{ color: focused ? "#70E575" : "grey" }}
                  size={size}
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
            tabBarIcon: ({ focused, size }) => {
              return (
                <IconComponent
                  library="MaterialCommunityIcons"
                  name="human-scooter"
                  style={{ color: focused ? "#70E575" : "grey" }}
                  size={size}
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
            tabBarIcon: ({ focused, size }) => {
              return (
                <IconComponent
                  library="MaterialCommunityIcons"
                  name="wrench"
                  style={{ color: focused ? "#70E575" : "grey" }}
                  size={size}
                />
              );
            },
            tabBarBadge: pendingCount?.toString(),
            tabBarBadgeStyle: {
              backgroundColor: "red",
              borderRadius: 10, // Adjust the border radius for smaller corners
              color: "white",
              fontSize: 10,
              fontWeight: "bold",
              display: pendingCount > 0 ? "flex" : "none",
            },
          }}
        />
        <Tab.Screen
          name={user ? "Profile" : "Auth"}
          component={user ? ProfileNavigator : AuthNavigator}
          options={{
            tabBarIcon: ({ focused, size }) => {
              return user && user.username ? (
                <View
                  className="bg-white w-12 h-12 rounded-full overflow-hidden"
                  style={{
                    borderColor: focused ? "#70E575" : "white",
                    borderWidth: 2,
                  }}
                >
                  {/* Si tu as une image d'avatar dans user, affiche-la, sinon affiche l'avatar avec username */}
                  {user.avatar ? (
                    <Image
                      source={{ uri: user.avatar }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Avatar
                      username={user.username}
                      style={{
                        backgroundColor: focused ? "#70E575" : "lightblue",
                      }}
                    />
                  )}
                </View>
              ) : (
                <IconComponent
                  library="MaterialCommunityIcons"
                  name="account-circle-outline"
                  style={{ color: focused ? "#70E575" : "lightblue" }}
                  size={size}
                />
              );
            },
            tabBarLabel: user ? "Profil" : "Connexion",
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
