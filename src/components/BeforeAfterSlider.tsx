import { View, Image, StyleSheet, Animated, PanResponder } from "react-native";
import { useRef, useState } from "react";
import { theme } from "../theme/theme";

interface Props {
  before: string;
  after: string;
  height?: number;
}

export default function BeforeAfterSlider({
  before,
  after,
  height = 300,
}: Props) {
  const containerWidth = useRef(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const [sliderX, setSliderX] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        let x = gesture.dx + sliderX;

        if (x < 0) x = 0;
        if (x > containerWidth.current) x = containerWidth.current;

        translateX.setValue(x);
      },
      onPanResponderRelease: (_, gesture) => {
        let x = gesture.dx + sliderX;

        if (x < 0) x = 0;
        if (x > containerWidth.current) x = containerWidth.current;

        setSliderX(x);
      },
    })
  ).current;

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={(e) => {
        containerWidth.current = e.nativeEvent.layout.width;
        translateX.setValue(containerWidth.current / 2);
        setSliderX(containerWidth.current / 2);
      }}
    >
      {/* Before */}
      <Image source={{ uri: before }} style={styles.image} />

      {/* After */}
      <Animated.View
        style={[
          styles.afterContainer,
          { width: translateX },
        ]}
      >
        <Image source={{ uri: after }} style={styles.image} />
      </Animated.View>

      {/* Handle */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.handle,
          { left: Animated.subtract(translateX, 12) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  afterContainer: {
    height: "100%",
    overflow: "hidden",
  },
  handle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: theme.colors.accentSolid,
    borderRadius: 12,
    opacity: 0.9,
  },
});
