import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { fetchCategories, CategoryData, getFullUrl } from "../services/contentApi";
import { categories as localCategories, SubcategoryType } from "../constants/categories";
import CategoryPill from "../components/CategoryPill";
import CategorySection from "../components/CategorySection";
import AppText from "../components/ui/AppText";
import { theme } from "../theme/theme";
import { useAuth } from "../context/AuthContext";
import { requestGalleryPermissionOnLaunch } from "../services/permissionService";
import SidebarDrawer from "../components/SidebarDrawer";

// Subcategory UI config
const SUBCATEGORY_CONFIG: Record<string, { title: string; icon: string }> = {
  photoshoot: { title: "Photo Shoot", icon: "camera" },
  catalogue: { title: "Catalogue", icon: "grid" },
  branding: { title: "Branding", icon: "sparkles" },
};

export default function HomeScreen({ navigation }: any) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubcategoryType>("photoshoot");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    requestGalleryPermissionOnLaunch();

    // Fetch categories from DB
    fetchCategories()
      .then((cats) => {
        // Convert image URLs to full URLs
        const mapped = cats.map((cat) => {
          const showcase = cat.showcase_items || {};
          // Convert photoshoot/branding before_url/after_url
          for (const key of ["photoshoot", "branding"] as const) {
            if (showcase[key]) {
              showcase[key] = (showcase[key] as any[]).map((item: any) => ({
                ...item,
                before_url: getFullUrl(item.before_url),
                after_url: getFullUrl(item.after_url),
              }));
            }
          }
          // Convert catalogue thumbnails image_url
          if (showcase.catalogue) {
            showcase.catalogue = showcase.catalogue.map((item: any) => ({
              ...item,
              thumbnails: item.thumbnails?.map((t: any) => ({
                ...t,
                image_url: getFullUrl(t.image_url),
              })),
            }));
          }
          return { ...cat, showcase_items: showcase };
        });
        setCategories(mapped);
        if (mapped.length > 0) setSelectedCategory(mapped[0].id);
      })
      .catch((err) => {
        console.warn("Failed to fetch categories from API, using local fallback:", err.message);
        // Fallback to local constants
        const fallback = localCategories.map((c) => ({
          id: c.id,
          title: c.title,
          icon: "",
          is_active: true,
          order: 0,
          subcategories: c.subcategories.map((s) => s.id),
          showcase_items: c.itemsBySubcategory as any,
          scenarios: [],
        }));
        setCategories(fallback as any[]);
        if (fallback.length > 0) setSelectedCategory(fallback[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleCategories = categories.filter(
    (cat) => cat.id === selectedCategory
  );

  const selectedCat = categories.find((c) => c.id === selectedCategory);
  const subcategoryIds = selectedCat?.subcategories || ["photoshoot", "catalogue", "branding"];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <AppText style={{ color: theme.colors.secondary, marginTop: 12 }}>Loading...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero header */}
      <View style={styles.header}>
        <AppText style={styles.heroTitle}>Discover</AppText>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ComingSoonAds")}
            style={styles.adsBtn}
          >
            <Ionicons name="videocam" size={20} color={theme.colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuBtn}>
            <Ionicons name="menu-outline" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category pills */}
      <View style={styles.capsuleContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.pills}
          renderItem={({ item }) => (
            <CategoryPill
              title={item.title}
              selected={item.id === selectedCategory}
              onPress={() => setSelectedCategory(item.id)}
            />
          )}
        />
      </View>

      {/* Subcategory selection */}
      <View style={styles.subcategoryContainer}>
        <View style={styles.subcategoryCards}>
          {subcategoryIds.map((subId) => {
            const cfg = SUBCATEGORY_CONFIG[subId] || { title: subId, icon: "help" };
            return (
              <TouchableOpacity
                key={subId}
                style={[
                  styles.subcategoryCard,
                  selectedSubcategory === subId && styles.subcategoryCardActive,
                ]}
                onPress={() => setSelectedSubcategory(subId as SubcategoryType)}
              >
                <View style={styles.subcategoryCenter}>
                  <Ionicons
                    name={cfg.icon as any}
                    size={24}
                    color={selectedSubcategory === subId ? theme.colors.accent : theme.colors.secondary}
                  />
                </View>
                <AppText style={[
                  styles.subcategoryCardTitle,
                  selectedSubcategory === subId && styles.subcategoryCardTitleActive,
                ]}>
                  {cfg.title}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Category content */}
      <FlatList
        data={visibleCategories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.sections}
        renderItem={({ item }) => (
          <CategorySection
            title={item.title}
            items={(item.showcase_items as any)?.[selectedSubcategory] || []}
            onTry={(showcaseItem: any) => {
              if (selectedSubcategory === "catalogue") {
                navigation.navigate("CatalogueMainModelSelection", {
                  categoryId: item.id,
                  subcategoryType: selectedSubcategory,
                  showcaseItem,
                });
              } else if (selectedSubcategory === "branding") {
                navigation.navigate("BrandingMainModelSelection", {
                  categoryId: item.id,
                  subcategoryType: selectedSubcategory,
                  showcaseItem,
                });
              } else {
                navigation.navigate("ModelSelection", {
                  categoryId: item.id,
                  subcategoryType: selectedSubcategory,
                  showcaseItem,
                });
              }
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Sidebar Drawer */}
      <SidebarDrawer
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onNavigate={(screen) => navigation.navigate(screen)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.safeTop,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  heroTitle: {
    ...theme.typography.hero,
    color: theme.colors.primary,
  },
  headerActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  adsBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: `${theme.colors.accent}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${theme.colors.accent}30`,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginTop: theme.spacing.xs,
  },
  capsuleContainer: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  pills: {
    paddingHorizontal: theme.spacing.screenPadding,
    gap: theme.spacing.sm,
  },
  sections: {
    padding: theme.spacing.screenPadding,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  subcategoryContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    // borderBottomWidth: 1,
    // borderColor: theme.colors.border,
  },
  subcategoryTitle: {
    ...theme.typography.title,
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  subcategoryCards: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  subcategoryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  subcategoryCardActive: {
    backgroundColor: `${theme.colors.accent}08`,
    borderColor: theme.colors.accent,
  },
  subcategoryCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
  subcategoryBadge: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  subcategoryBadgeActive: {
    backgroundColor: `${theme.colors.accent}20`,
  },
  subcategoryBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    fontSize: 11,
  },
  subcategoryBadgeTextActive: {
    color: theme.colors.accent,
    fontWeight: "600",
  },
  subcategoryCardTitle: {
    ...theme.typography.subtitle,
    fontSize: 12,
    color: theme.colors.primary,
    marginBottom: 0,
    textAlign: "center",
  },
  subcategoryCardTitleActive: {
    color: theme.colors.accent,
  },
  subcategoryCardDesc: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    lineHeight: 16,
  },
  subcategoryCardDescActive: {
    color: theme.colors.primary,
  },
  selectedIndicator: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
});
