import { Image, Pressable, StyleSheet, ImageSourcePropType } from "react-native";
import AppText from "./ui/AppText";
import { theme } from "../theme/theme";

interface Props {
  image: ImageSourcePropType | string;
  name: string;
  selected: boolean;
  onPress: () => void;
}

export default function ModelCard({
  image,
  name,
  selected,
  onPress,
}: Props) {
  const imageSource = typeof image === "string" ? { uri: image } : image;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <Image source={imageSource} style={styles.image} />
      <AppText style={[styles.name, selected && styles.selectedName]}>{name}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  selected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
    ...theme.shadows.glow,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
  },
  name: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
    color: theme.colors.secondary,
    paddingBottom: theme.spacing.xs,
  },
  selectedName: {
    color: theme.colors.accent,
  },
});
