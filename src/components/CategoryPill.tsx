import { Pressable, StyleSheet } from "react-native";
import AppText from "./ui/AppText";
import { theme } from "../theme/theme";

export default function CategoryPill({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected && styles.selected,
        pressed && { opacity: 0.8 },
      ]}
    >
      <AppText
        style={[
          styles.text,
          selected && styles.selectedText,
        ]}
      >
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: theme.colors.accentSolid,
    borderColor: theme.colors.accentSolid,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    includeFontPadding: false,
    color: theme.colors.secondary,
  },
  selectedText: {
    color: theme.colors.white,
  },
});
