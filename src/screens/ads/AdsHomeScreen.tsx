import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/ui/AppText";
import AppHeader from "../../components/ui/AppHeader";
import { theme } from "../../theme/theme";
import { adsCategories, AdsCategory } from "../../constants/adsCategories";

export default function AdsHomeScreen({ navigation }: any) {
  const handleCategorySelect = (category: AdsCategory) => {
    console.log("Selected category:", category.id);
    navigation.navigate("AdsPrompt", { category });
  };

  const renderCategory = ({ item }: { item: AdsCategory }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategorySelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={32} color={theme.colors.accent} />
      </View>
      <View style={styles.categoryContent}>
        <AppText style={styles.categoryTitle}>{item.title}</AppText>
        <AppText style={styles.categoryDescription}>{item.description}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Create Ads" />

      <View style={styles.content}>
        <View style={styles.heroSection}>
          <AppText style={styles.heroTitle}>AI Video Ads</AppText>
          <AppText style={styles.heroSubtitle}>
            Create engaging video advertisements with AI
          </AppText>
        </View>

        <AppText style={styles.sectionTitle}>Choose a Category</AppText>

        <FlatList
          data={adsCategories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.screenPadding,
  },
  heroSection: {
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    ...theme.typography.hero,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.sm,
    backgroundColor: `${theme.colors.accent}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  categoryDescription: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
  },
});
