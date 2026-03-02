import { Pressable, StyleSheet } from "react-native";
import AppText from "./ui/AppText";
import { theme } from "../theme/theme";
import { MaterialIcons } from "@expo/vector-icons";

export default function UploadModelCard({
  selected,
  onPress,
}: {
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <MaterialIcons
        name="add-a-photo"
        size={32}
        color={selected ? theme.colors.accent : theme.colors.muted}
      />
      <AppText style={[styles.text, selected && styles.selectedText]}>
        Upload Your Photo
      </AppText>
      <AppText style={styles.hint}>Tap to choose</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 200,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  selected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
    borderStyle: "solid",
    ...theme.shadows.glow,
  },
  text: {
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.secondary,
  },
  selectedText: {
    color: theme.colors.accent,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.muted,
  },
});
