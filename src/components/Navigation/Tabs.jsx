import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Keyboard,
} from "react-native";
import { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import NavigateNavigator from "./Stack/NavigateNavigator";
import HomeNavigator from "./Stack/HomeNavigator";
import ProfileNavigator from "./Stack/ProfileNavigator";
import MaintainsNavigator from "./Stack/MaintainsNavigator";
import RouteTraveledNavigator from "./Stack/RouteTraveledNavigator";
import React, { useEffect, useState } from "react";
import IconComponent from "../Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../Avatar";
import AuthNavigator from "./Stack/AuthNavigator";
import { UserContext } from "../../context/AuthContext";
import { useVehicleData } from "../../context/VehicleDataContext";
import { useNavigationMode } from "../../context/NavigationModeContext";
const Tab = createBottomTabNavigator();

//Bouton custom pour le navigation
const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity activeOpacity={1} onPress={onPress}>
    <View className="flex w-20 h-20 top-[-40] rounded-full bg-white justify-center items-center">
      {children}
    </View>
  </TouchableOpacity>
);

const Tabs = () => {
  const { mode } = useNavigationMode();
  const { user } = useContext(UserContext);
  const { pendingCount, vehicles } = useVehicleData();
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

  // 1. Crée la liste des tabs (hors Navigate)
  const baseTabs = [
    {
      name: "Home",
      component: HomeNavigator,
      icon: (focused, size) => (
        <IconComponent
          library="MaterialCommunityIcons"
          name="home-analytics"
          style={{ color: focused ? "#70E575" : "grey" }}
          size={size}
        />
      ),
      options: ({ route }) => ({
        navigationBarColor: "#FFFFFF",
        tabBarStyle: ((route) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "";
          if (routeName === "TrackingDetailsScreen" || mode === "travel") {
            return { display: "none" };
          }
          return tabBarStyle;
        })(route),
      }),
    },
    {
      name: "RouteTraveledNavigator",
      component: RouteTraveledNavigator,
      icon: (focused, size) => (
        <IconComponent
          library="MaterialCommunityIcons"
          name="map-marker-path"
          style={{ color: focused ? "#70E575" : "grey" }}
          size={size}
        />
      ),
      options: ({ route }) => ({
        navigationBarColor: "#FFFFFF",
        tabBarStyle: ((route) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "";
          if (routeName === "TrackingDetailsScreen") {
            return { display: "none" };
          }
          return tabBarStyle;
        })(route),
      }),
    },
  ];

  // Si user connecté, ajoute Maintains avant Profile/Auth
  if (user && vehicles && vehicles.length > 0) {
    baseTabs.push({
      name: "maintains",
      component: MaintainsNavigator,
      icon: (focused, size) => (
        <IconComponent
          library="MaterialCommunityIcons"
          name="wrench"
          style={{ color: focused ? "#70E575" : "grey" }}
          size={size}
        />
      ),
      options: {
        tabBarBadge: pendingCount?.toString(),
        tabBarBadgeStyle: {
          backgroundColor: "red",
          borderRadius: 10,
          color: "white",
          fontSize: 10,
          fontWeight: "bold",
          display: pendingCount > 0 ? "flex" : "none",
        },
      },
    });
  }

  // Ajoute Profile/Auth à la fin
  baseTabs.push({
    name: user ? "Profile" : "Auth",
    component: user ? ProfileNavigator : AuthNavigator,
    icon: (focused, size) =>
      user && user.username ? (
        <View
          className="bg-white w-12 h-12 rounded-full overflow-hidden"
          style={{
            borderColor: focused ? "#70E575" : "white",
            borderWidth: 2,
          }}
        >
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
      ),
    options: {
      tabBarLabel: user ? "Profil" : "Connexion",
    },
  });

  // 2. Calcule l'index central et insère Navigate
  // Calcule le nombre de tabs SANS Navigate
  const tabsWithoutNavigate = [...baseTabs];
  const totalTabs = tabsWithoutNavigate.length + 1; // +1 pour Navigate

  // Calcule l'index central pour insérer Navigate
  const middleIndex = Math.floor(totalTabs / 2);

  baseTabs.splice(middleIndex, 0, {
    name: "Navigate",
    component: NavigateNavigator,
    icon: (focused, size) => (
      <IconComponent
        library="MaterialCommunityIcons"
        name="human-scooter"
        style={{ color: focused ? "#70E575" : "grey" }}
        size={size}
      />
    ),
    options: ({ route }) => ({
      tabBarStyle: ((route) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? "";
        if (mode === "itinerary" || mode === "travel") {
          return { display: "none" };
        }
        return tabBarStyle;
      })(route),
      tabBarButton: (props) => <CustomTabBarButton {...props} />,
    }),
  });
  if (baseTabs.length % 2 === 0) {
    // Ajoute le dummy APRÈS Navigate
    baseTabs.splice(middleIndex + 1, 0, {
      name: "Dummy",
      component: () => null,
      icon: () => null,
      options: {
        tabBarButton: () => null,
        tabBarIcon: () => null,
        tabBarLabel: () => null,
      },
    });
  }
  // 3. Rendu dynamique des tabs
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
        {baseTabs.map((tab, idx) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={({ route }) => ({
              ...(typeof tab.options === "function"
                ? tab.options({ route })
                : tab.options),
              tabBarIcon: ({ focused, size }) => tab.icon(focused, size),
            })}
          />
        ))}
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


