import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AppText from "./AppText";
import { theme } from "../../theme/theme";

export default function AppHeader({
  title,
  onBack,
  rightIcon,
  onRightPress,
}: {
  title: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        <AppText style={styles.title}>{title}</AppText>

        {rightIcon && onRightPress ? (
          <Pressable onPress={onRightPress} style={styles.backBtn} hitSlop={12}>
            <Ionicons name={rightIcon as any} size={20} color={theme.colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.safeTop,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  inner: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.screenPadding,
  },
  title: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  back: {
    fontSize: 20,
    color: theme.colors.primary,
  },
  placeholder: {
    width: 36,
  },
});
