import * as React from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useAnimatedValue,
} from "react-native";

export type Props = React.ComponentPropsWithRef<typeof View> & {
  animating?: boolean;
  color?: string;
  size?: number;
  hidesWhenStopped?: boolean;
  style?: StyleProp<ViewStyle>;
};

const DURATION = 2400;

const ActivityIndicator = ({
  animating = true,
  color: indicatorColor,
  hidesWhenStopped = true,
  size: indicatorSize = 24,
  style,
  ...rest
}: Props) => {
  const timer = useAnimatedValue(0);
  const fade = useAnimatedValue(!animating && hidesWhenStopped ? 0 : 1);

  const rotation = React.useRef<Animated.CompositeAnimation | undefined>(
    undefined
  );

  const startRotation = React.useCallback(() => {
    Animated.timing(fade, {
      duration: 200,
      toValue: 1,
      isInteraction: false,
      useNativeDriver: true,
    }).start();

    if (rotation.current) {
      timer.setValue(0);
      Animated.loop(rotation.current).start();
    }
  }, [fade, timer]);

  const stopRotation = () => {
    if (rotation.current) {
      rotation.current.stop();
    }
  };

  React.useEffect(() => {
    if (rotation.current === undefined) {
      rotation.current = Animated.timing(timer, {
        duration: DURATION,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
        toValue: 1,
        isInteraction: false,
      });
    }

    if (animating) {
      startRotation();
    } else if (hidesWhenStopped) {
      Animated.timing(fade, {
        duration: 200,
        toValue: 0,
        useNativeDriver: true,
        isInteraction: false,
      }).start(stopRotation);
    } else {
      stopRotation();
    }
  }, [animating, fade, hidesWhenStopped, startRotation, timer]);

  const color = indicatorColor;
  const size =
    typeof indicatorSize === "string"
      ? indicatorSize === "small"
        ? 24
        : 48
      : indicatorSize
      ? indicatorSize
      : 24;

  const frames = (60 * DURATION) / 1000;
  const easing = Easing.bezier(0.4, 0.0, 0.7, 1.0);
  const containerStyle = {
    width: size,
    height: size / 2,
    overflow: "hidden" as const,
  };

  return (
    <View
      style={[styles.container, style]}
      {...rest}
      accessible
      accessibilityRole="progressbar"
      accessibilityState={{ busy: animating }}
    >
      <Animated.View
        style={[{ width: size, height: size, opacity: fade }]}
        collapsable={false}
      >
        {[0, 1].map((index) => {
          const inputRange = Array.from(
            new Array(frames),
            (_, frameIndex) => frameIndex / (frames - 1)
          );
          const outputRange = Array.from(new Array(frames), (_, frameIndex) => {
            let progress = (2 * frameIndex) / (frames - 1);
            const rotation = index ? +(360 - 15) : -(180 - 15);

            if (progress > 1.0) {
              progress = 2.0 - progress;
            }

            const direction = index ? -1 : +1;

            return `${direction * (180 - 30) * easing(progress) + rotation}deg`;
          });

          const layerStyle = {
            width: size,
            height: size,
            transform: [
              {
                rotate: timer.interpolate({
                  inputRange: [0, 1],
                  outputRange: [`${0 + 30 + 15}deg`, `${2 * 360 + 30 + 15}deg`],
                }),
              },
            ],
          };

          const viewportStyle: Animated.WithAnimatedValue<
            StyleProp<ViewStyle>
          > = {
            width: size,
            height: size,
            transform: [
              {
                translateY: index ? -size / 2 : 0,
              },
              {
                rotate: timer.interpolate({ inputRange, outputRange }),
              },
            ],
          };

          const offsetStyle = index ? { top: size / 2 } : null;

          const lineStyle = {
            width: size,
            height: size,
            borderColor: color,
            borderWidth: size / 10,
            borderRadius: size / 2,
          };

          return (
            <Animated.View key={index} style={[styles.layer]}>
              <Animated.View style={layerStyle}>
                <Animated.View
                  style={[containerStyle, offsetStyle]}
                  collapsable={false}
                >
                  <Animated.View style={viewportStyle}>
                    <Animated.View style={containerStyle} collapsable={false}>
                      <Animated.View style={lineStyle} />
                    </Animated.View>
                  </Animated.View>
                </Animated.View>
              </Animated.View>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ActivityIndicator;
