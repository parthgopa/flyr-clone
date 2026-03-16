import { View, FlatList, StyleSheet } from "react-native";
import AppText from "./ui/AppText";
import CategoryCard from "./CategoryCard";
import CatalogueCard from "./CatalogueCard";
import { theme } from "../theme/theme";

export default function CategorySection({
  title,
  items,
  onTry,
}: any) {
  return (
    <View style={styles.container}>
      {/* <AppText style={styles.title}>{title}</AppText> */}

      <FlatList
        data={items}
        keyExtractor={(item: any) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }: any) => {
          // Check if item has thumbnails (catalogue) or before/after (photoshoot/branding)
          if (item.thumbnails) {
            return (
              <CatalogueCard
                title={item.id}
                thumbnails={item.thumbnails}
                onPress={() => onTry(item)}
              />
            );
          } else {
            return (
              <CategoryCard
                title={item.id}
                before={item.before_url || item.before}
                after={item.after_url || item.after}
                onPress={() => onTry(item)}
              />
            );
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.lg,
  },
});
