import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  useAnimatedValue,
} from "react-native";
import LottieView from "lottie-react-native";
import IconComponent from "../components/Icons";
import * as Location from "expo-location";
import * as ExpoSplashScreen from "expo-splash-screen";

import PermissionScreen from "./PermissionLocationScreen";
ExpoSplashScreen.preventAutoHideAsync();
const messages = require("../../assets/SplashScreen/messages.json");
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);
const AnimatedLottieViewSplash2 = Animated.createAnimatedComponent(LottieView);
const AnimatedLottieViewText = Animated.createAnimatedComponent(LottieView);

const SplashScreen = ({ navigation, onAnimationFinish }) => {
  const opacityAnimationLoading = useAnimatedValue(0);
  const opacityAnimationSplash1 = useAnimatedValue(1);
  const opacityAnimationSplash2 = useAnimatedValue(0);
  const splashScreen2 = useRef(null);

  const screenWidth = Dimensions.get("window").width;
  const translateX = useAnimatedValue(-screenWidth);

  // Choix aléatoire d'un message
  const randomIndex = Math.floor(Math.random() * messages.length);
  const randomMessage = messages[randomIndex];

  const handleAnimationComplete = () => {
    Animated.timing(translateX, {
      toValue: screenWidth,
      duration: 2800,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnimationSplash1, {
      toValue: 0,
      duration: 200, // Durée de l'animation de fondu en millisecondes
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnimationSplash2, {
      toValue: 1,
      duration: 200, // Durée de l'animation de fondu en millisecondes
      useNativeDriver: true,
    }).start();
    splashScreen2.current?.play(1);
  };

  const startScrollAnimation = (event) => {
    const { width } = event.nativeEvent.layout;
    console.log("screenWidth", screenWidth, width, translateX);
    // Animation de déplacement
    Animated.timing(translateX, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  };

  const permissionsCheck = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    // if (status !== "granted") {

    //   // Si la permission n'est pas accordée, on redirige vers l'écran de permission
    //  navigation.replace("ChoiceAddress");
    // }
  };

  async function prepare() {
    try {
      Animated.timing(opacityAnimationLoading, {
        toValue: 1,
        duration: 200, // Durée de l'animation de fondu en millisecondes
        useNativeDriver: true,
      }).start();

      //Vérification permission
      await permissionsCheck();
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay
    } catch (e) {
      console.warn("Error : " + e);
    } finally {
      handleAnimationComplete();
    }
  }
  const onLayoutRootView = useCallback(async () => {
    await ExpoSplashScreen.hide();
  }, []);

  return (
    <View
      className="flex-1 bg-[#70E575] justify-center items-center"
      onLayout={onLayoutRootView}
    >
      <>
        <Animated.View
          style={[
            styles.animationContainer,
            { opacity: opacityAnimationSplash1 },
          ]}
        >
          <AnimatedLottieView
            source={require("../../assets/anims/Jolt-SplashScreen-Part1.json")}
            style={[styles.animation]}
            loop={false}
            autoPlay
            onAnimationFinish={prepare}
          />
          <AnimatedLottieViewSplash2
            source={require("../../assets/anims/Loading.json")}
            style={[
              styles.loadingAnimation,
              { opacity: opacityAnimationLoading },
            ]}
            loop={true}
            autoPlay
          />
        </Animated.View>
        <AnimatedLottieViewText
          ref={splashScreen2}
          source={require("../../assets/anims/Jolt-SplashScreen-Part2.json")}
          style={[styles.animation, { opacity: opacityAnimationSplash2 }]}
          loop={false}
          onAnimationFinish={() => {
            onAnimationFinish();
            // navigation.replace("HomeScreen");

            // onEnd();
          }}
        />
        <View onLayout={startScrollAnimation} className="w-fit py-2 top-72">
          <Animated.Text
            style={[
              styles.messageContainer,
              { transform: [{ translateX: translateX }] },
            ]}
          >
            <Text style={styles.message}>{randomMessage.text}</Text>

            <IconComponent
              library={randomMessage.library}
              icon={randomMessage.icon}
              style={[styles.icon, randomMessage.style]}
            />
          </Animated.Text>
        </View>
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    width: "100%",
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  animation: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  loadingAnimation: {
    width: "30%",
    height: "30%",
    top: "50%",
    position: "absolute",
  },
  bannerText: {
    color: "white",
    textAlign: "center",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
  },
  icon: {
    fontSize: 20,
    marginLeft: 5,
  },
  message: {
    fontSize: 16,
  },
});

export default SplashScreen;
