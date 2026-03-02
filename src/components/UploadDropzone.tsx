import { View, StyleSheet, Pressable } from "react-native";
import AppText from "./ui/AppText";
import { theme } from "../theme/theme";
import { MaterialIcons } from "@expo/vector-icons";

export default function UploadDropzone({
  onPick,
  onCamera,
}: {
  onPick: () => void;
  onCamera: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons
          name="cloud-upload"
          size={28}
          color={theme.colors.accent}
        />
      </View>

      <AppText style={styles.title}>Upload product image</AppText>
      <AppText style={styles.subtitle}>PNG, JPG up to 10MB</AppText>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
          onPress={onPick}
        >
          <MaterialIcons name="image" size={16} color={theme.colors.white} />
          <AppText style={styles.btnText}>Gallery</AppText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.button, styles.buttonOutline, pressed && { opacity: 0.8 }]}
          onPress={onCamera}
        >
          <MaterialIcons name="photo-camera" size={16} color={theme.colors.accent} />
          <AppText style={styles.btnTextOutline}>Camera</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
    color: theme.colors.primary,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.accentSolid,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
  },
  btnText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  btnTextOutline: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
});
