import { View, Text } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import React, { useEffect } from "react";
const Ripple = (props) => {
  const progress = useSharedValue(0);

  const startAnimation = () => {
    progress.value = withTiming(
      150,
      {
        duration: 5000,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          runOnJS(props.handleFinish)(null);
        } else {
          progress.value = 0;
        }
      }
    );
  };

  React.useEffect(() => {
    startAnimation();
  }, []);

  useEffect(() => {
    if (props.stopAnimation) {
      cancelAnimation(progress);
    }
  }, [props.stopAnimation]);

  const aStyle = useAnimatedStyle(() => {
    const width = progress.value;

    return {
      width: width,
    };
  });

  return (
    <Animated.View style={props.contentContainerStyle}>
      <Animated.View style={[aStyle, props.style]} />
      <View>{props.children}</View>
    </Animated.View>
  );
};

export default Ripple;
