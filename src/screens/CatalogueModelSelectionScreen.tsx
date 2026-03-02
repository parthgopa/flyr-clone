import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../components/ui/AppText";
import AppHeader from "../components/ui/AppHeader";
import AppButton from "../components/ui/AppButton";
import { theme } from "../theme/theme";
import { catalogueModels as localCatalogueModels, CatalogueModelPhoto } from "../constants/catalogueModels";
import { fetchCatalogueModel, getFullUrl } from "../services/contentApi";

interface Props {
  navigation: any;
  route: any;
}

interface PhotoItem {
  id: string;
  image: any;
  image_url?: string;
  type: string;
  label: string;
}

export default function CatalogueModelSelectionScreen({ navigation, route }: Props) {
  const { categoryId, modelId, modelName } = route.params;
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showAllModelViews, setShowAllModelViews] = useState(false);
  const [allModelPhotos, setAllModelPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalogueModel(modelId)
      .then((data) => {
        const photos = (data.photos || []).map((p: any) => ({
          id: p.id,
          image: { uri: getFullUrl(p.image_url) },
          image_url: getFullUrl(p.image_url),
          type: p.type,
          label: p.label,
        }));
        setAllModelPhotos(photos);
      })
      .catch((err) => {
        console.warn("Failed to fetch catalogue model, using local fallback:", err.message);
        const local = localCatalogueModels.find((m) => m.id === modelId);
        if (local) {
          setAllModelPhotos(local.photos as any[]);
        }
      })
      .finally(() => setLoading(false));
  }, [modelId]);

  // Group photos by type
  const modelViewPhotos = allModelPhotos.filter(photo => photo.type === "model");
  const studioViewPhotos = allModelPhotos.filter(photo => photo.type === "studio");
  const highlightPhotos = allModelPhotos.filter(photo => photo.type === "highlight");

  const displayedModelViews = showAllModelViews ? modelViewPhotos : modelViewPhotos.slice(0, 6);

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      } else if (prev.length < 4) {
        return [...prev, photoId];
      } else {
        return prev;
      }
    });
  };

  const handleContinue = () => {
    if (selectedPhotos.length === 0) {
      Alert.alert("Selection Required", "Please select at least 1 photo.");
      return;
    }

    const selectedModelPhotos = allModelPhotos.filter(photo => selectedPhotos.includes(photo.id));

    // Navigate to catalogue upload screen with selected photos
    navigation.navigate("CatalogueUpload", {
      categoryId,
      selectedModels: selectedModelPhotos,
      modelName,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  const renderPhoto = ({ item }: { item: PhotoItem }) => {
    const imageSource = item.image_url ? { uri: item.image_url } : item.image;
    return (
      <TouchableOpacity
        style={[
          styles.photoContainer,
          selectedPhotos.includes(item.id) && styles.photoSelected,
        ]}
        onPress={() => togglePhotoSelection(item.id)}
      >
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.photo} />
          {selectedPhotos.includes(item.id) && (
            <View style={styles.selectionOverlay}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent} />
            </View>
          )}
        </View>
        <AppText style={styles.photoLabel}>{item.label}</AppText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={`${modelName} - Select Photos`} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Model Views Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Model Views</AppText>
          <FlatList
            data={displayedModelViews}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.photoRow}
          />

          {modelViewPhotos.length > 6 && (
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => setShowAllModelViews(!showAllModelViews)}
            >
              <AppText style={styles.seeMoreText}>
                {showAllModelViews ? "Show Less" : "See More"}
              </AppText>
              <Ionicons
                name={showAllModelViews ? "chevron-up" : "chevron-down"}
                size={16}
                color={theme.colors.accent}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Studio Views Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Studio Views</AppText>
          <FlatList
            data={studioViewPhotos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.photoRow}
          />
        </View>

        {/* Key Highlights Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Key Highlights</AppText>
          <FlatList
            data={highlightPhotos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.photoRow}
          />
        </View>

        {/* Selection Info */}
        <View style={styles.selectionInfo}>
          <AppText style={styles.selectionText}>
            Selected: {selectedPhotos.length}/4 photos
          </AppText>
          {selectedPhotos.length >= 4 && (
            <AppText style={styles.maxSelectionText}>
              Maximum 4 photos selected
            </AppText>
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <AppButton
          title="Continue"
          onPress={handleContinue}
          disabled={selectedPhotos.length === 0}
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
    padding: theme.spacing.screenPadding,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.title,
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  photoRow: {
    justifyContent: "space-between",
  },
  photoContainer: {
    width: "30%",
    borderRadius: theme.radius.md,
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: "relative",
  },
  photoSelected: {
    borderColor: theme.colors.accent,
    borderWidth: 3,
  },
  imageContainer: {
    aspectRatio: 1,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoLabel: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    textAlign: "center",
    paddingVertical: theme.spacing.xs,
    fontSize: 10,
    backgroundColor: theme.colors.surface,
  },
  selectionOverlay: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 2,
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  seeMoreText: {
    ...theme.typography.body,
    color: theme.colors.accent,
    marginRight: theme.spacing.xs,
  },
  selectionInfo: {
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  selectionText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  maxSelectionText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    marginTop: theme.spacing.xs,
    fontStyle: "italic",
  },
  footer: {
    padding: theme.spacing.screenPadding,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});
