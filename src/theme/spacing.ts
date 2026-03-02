import { Platform } from "react-native";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  screenPadding: 20,
  safeTop: Platform.OS === "ios" ? 54 : 40,
};
