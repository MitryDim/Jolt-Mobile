import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import IconComponent from "../components/Icons";
const messages = require("../../assets/messages.json");
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const SplashScreen = ({ navigation }) => {
  const opacityAnimationLoading = new Animated.Value(0);
  const opacityAnimationSplash1 = new Animated.Value(1);
  const opacityAnimationSplash2 = new Animated.Value(0);
  const splashScreen2 = useRef(null);

  const screenWidth = Dimensions.get("window").width;
  const translateX = useRef(new Animated.Value(-screenWidth)).current;
  const bannerRef = useRef(null);

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

    // Animation de déplacement
    Animated.timing(translateX, {
      toValue: (screenWidth - width) / 2,
      duration: 3000,
      useNativeDriver: true,
    }).start();
  };

  async function prepare() {
    try {
      Animated.timing(opacityAnimationLoading, {
        toValue: 1,
        duration: 200, // Durée de l'animation de fondu en millisecondes
        useNativeDriver: true,
      }).start();
      await new Promise((resolve) => setTimeout(resolve, 4000)); // Delay
    } catch (e) {
      console.warn(e);
    } finally {
      handleAnimationComplete();
    }
  }

  return (
    <View className="flex-1 bg-[#70E575] justify-center items-center">
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
          <AnimatedLottieView
            source={require("../../assets/anims/Loading.json")}
            style={[
              styles.loadingAnimation,
              { opacity: opacityAnimationLoading },
            ]}
            loop={true}
            autoPlay
          />
        </Animated.View>
        <AnimatedLottieView
          ref={splashScreen2}
          source={require("../../assets/anims/Jolt-SplashScreen-Part2.json")}
          style={[styles.animation, { opacity: opacityAnimationSplash2 }]}
          loop={false}
          onAnimationFinish={() => {
            navigation.replace("Home");
          }}
        />
        {/* bg-[rgba(0,0,0,0.10)] */}
        <View className=" w-full py-2 top-72">
          <Animated.Text
            style={[
              styles.messageContainer,
              { transform: [{ translateX: translateX }] },
            ]}
            onLayout={startScrollAnimation}
          >
            <Text style={styles.message}>{randomMessage.text}</Text>
            <View>
              <IconComponent
                library={randomMessage.library}
                icon={randomMessage.icon}
                style={[styles.icon,randomMessage.style]}
              />
            </View>
          </Animated.Text>
        </View>
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#70E575",
    justifyContent: "center",
    alignItems: "center",
  },
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
    textAlign: "center",
  },
});

export default SplashScreen;
